import Order from '../models/order.model.js'
import Item from '../models/item.model.js'
import Shop from '../models/shop.model.js'
import User from '../models/user.model.js'
import DeliveryAssignment from '../models/deliveryAssignment.model.js'

const assignDeliveryBoyToShopOrder = async (order, shopOrder) => {
    const { longitude, latitude } = order.deliveryAddress || {}
    const deliveryBoyQuery = { role: 'deliveryBoy' }
    const allDeliveryBoys = await User.find(deliveryBoyQuery).lean()

    if (!allDeliveryBoys.length) return null

    let candidateBoys = allDeliveryBoys
    if (longitude != null && latitude != null) {
        const nearbyDeliveryBoys = await User.find({
            ...deliveryBoyQuery,
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [Number(longitude), Number(latitude)]
                    },
                    $maxDistance: 5000
                }
            }
        }).lean()

        if (nearbyDeliveryBoys.length) {
            candidateBoys = nearbyDeliveryBoys
        }
    }

    const preferredBoy = candidateBoys.find(b => /ashok\s+sharma/i.test(b.fullName || '')) || candidateBoys[0]

    const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        broadcastedTo: candidateBoys.map(b => b._id),
        assignedTo: preferredBoy._id,
        status: 'assigned',
        assignedAt: new Date(),
    })

    shopOrder.assignedDeliveryBoy = preferredBoy._id
    shopOrder.assignment = deliveryAssignment._id

    return {
        deliveryAssignment,
        assignedBoy: preferredBoy,
        deliveryBoys: candidateBoys.map(b => ({
            id: b._id,
            name: b.fullName,
            longitude: b.location?.coordinates?.[0],
            latitude: b.location?.coordinates?.[1],
            mobile: b.mobile,
            email: b.email,
        }))
    }
}

export const placeOrder = async (req, res) => {
    try {
        const userId = req.userid
        if (!userId) return res.status(401).json({ message: 'Unauthorized' })

        const { cartItems, paymentMethod, deliveryAddress } = req.body
        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart items are required' })
        }

        if (!deliveryAddress || !deliveryAddress.text || !deliveryAddress.latitude || !deliveryAddress.longitude) {
            return res.status(400).json({ message: 'Invalid delivery address' })
        }

        if (!paymentMethod || !['cod', 'online'].includes(paymentMethod)) {
            return res.status(400).json({ message: 'Invalid payment method' })
        }

        // Normalize and validate items
        const itemsInput = cartItems.map(ci => ({ itemId: ci.itemId || ci.id || ci._id, quantity: Number(ci.quantity) || 1 }))
        const itemIds = itemsInput.map(i => i.itemId)
        const dbItems = await Item.find({ _id: { $in: itemIds } }).lean()
        const dbItemMap = dbItems.reduce((acc, it) => { acc[it._id.toString()] = it; return acc }, {})

        const shopGroups = {}
        let totalAmount = 0

        for (const ci of itemsInput) {
            const dbItem = dbItemMap[ci.itemId]
            if (!dbItem) return res.status(400).json({ message: `Item not found: ${ci.itemId}` })
            const shopId = dbItem.shop?.toString()
            if (!shopId) return res.status(400).json({ message: 'Item has no associated shop' })

            const price = Number(dbItem.price || 0)
            const qty = Number(ci.quantity || 1)
            const lineTotal = price * qty
            totalAmount += lineTotal

            if (!shopGroups[shopId]) shopGroups[shopId] = { items: [], subtotal: 0 }
            shopGroups[shopId].items.push({ item: dbItem._id, price, quantity: qty })
            shopGroups[shopId].subtotal += lineTotal
        }

        const shopIds = Object.keys(shopGroups)
        const shops = await Shop.find({ _id: { $in: shopIds } }).lean()
        const shopMap = shops.reduce((acc, s) => { acc[s._id.toString()] = s; return acc }, {})

        const shopOrderArray = shopIds.map(sid => ({
            shop: sid,
            owner: shopMap[sid]?.owner || null,
            subtotal: shopGroups[sid].subtotal,
            shopOrderItems: shopGroups[sid].items,
        }))

        const orderData = {
            user: userId,
            paymentMethod,
            deliveryAddress,
            totalAmount,
            shopOrder: shopOrderArray,
        }

        const order = new Order(orderData)
        await order.save()

        for (const shopOrder of order.shopOrder) {
            await assignDeliveryBoyToShopOrder(order, shopOrder)
        }

        await order.save()
        await order.populate('shopOrder.assignedDeliveryBoy', 'fullName email mobile')

        return res.status(201).json({ message: 'Order placed', order })
    } catch (error) {
        console.error('Error placing order:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const getUserOrders = async (req, res) => {
    try {
        const userId = req.userid              // ← was req.userId
        const user = await User.findById(userId)
        if (!user) return res.status(404).json({ message: 'User not found' })

        if (user.role === 'user') {
            const orders = await Order.find({ user: userId })
                .sort({ createdAt: -1 })
                .populate("shopOrder.shop", "name")
                .populate("shopOrder.owner", "fullName email mobile")
                .populate("shopOrder.shopOrderItems.item", "name image price")
                .populate("shopOrder.assignedDeliveryBoy", "fullName email mobile")
            return res.json(orders)
        } else {
            return res.status(403).json({ message: 'Not authorized for this route' })
        }
    } catch (error) {
        return res.status(500).json({ message: "Get User Order Error" })
    }
}

export const getOwnerOrders = async (req, res) => {
    try {
        const userId = req.userid
        const orders = await Order.find({ "shopOrder.owner": userId })
            .sort({ createdAt: -1 })
            .populate("user", "fullName email mobile")
            .populate("shopOrder.shop", "name")
            .populate("shopOrder.owner", "fullName email mobile")
            .populate("shopOrder.shopOrderItems.item", "name image price")
            .populate("shopOrder.assignedDeliveryBoy", "fullName email mobile")
        return res.json(orders)
    } catch (error) {
        return res.status(500).json({ message: "Get Owner Order Error" })
    }
}

export const updateShopOrderStatus = async (req, res) => {
    try {
        const ownerId = req.userid;
        const { orderId, shopOrderId } = req.params;
        const { status } = req.body;

        const validStatuses = [
            'pending',
            'preparing',
            'Out for delivery',
            'delivered',
            'cancelled'
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const shopOrder = order.shopOrder.id(shopOrderId);
        if (!shopOrder) {
            return res.status(404).json({ message: 'Shop order not found' });
        }

        // Ensure this owner owns that sub-order
        if (shopOrder.owner?.toString() !== ownerId?.toString()) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        shopOrder.status = status;
        let deliveryBoyPayload = [];
        if (status === 'Out for delivery' || !shopOrder.assignment) {
            const assignmentResult = await assignDeliveryBoyToShopOrder(order, shopOrder)

            if (!assignmentResult) {
                await order.save();
                return res.status(200).json({
                    message: 'order status updated but there is no available delivery boys'
                })
            }

            deliveryBoyPayload = assignmentResult.deliveryBoys
        }

        await order.save();
        await shopOrder.save()

        await order.populate('shopOrder.shop', 'name')
            .populate('shopOrder.owner', 'fullName email mobile')
            .populate('shopOrder.shopOrderItems.item', 'name image price')
            .populate('shopOrder.assignedDeliveryBoy', 'fullName email mobile')

        const updatedShopOrder = order.shopOrder.id(shopOrderId)

        return res.status(200).json({ 
            shopOrder: updatedShopOrder,
            assignedDeliveryBoy: updatedShopOrder.assignedDeliveryBoy,
            deliveryBoys: deliveryBoyPayload,
            assignment: updatedShopOrder.assignment
        });

    } catch (error) {
        console.error('updateShopOrderStatus error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getDeliveryBoyAssignment = async(req, res)=>{
    try{
         const deliveryBoyId = req.userid
         const assignments = await DeliveryAssignment.find({
            broadcastedTo: deliveryBoyId,
            status: 'broadcasted'
         })
         .populate("order")
         .populate("shop", "name")

         const formatted = assignments.map(a => ({
            orderId: a.order?._id,
            shopName: a.shop?.name,
            deliveryAddress: a.order?.deliveryAddress,
            items: a.order?.shopOrder?.find(so => so._id.toString() === a.shopOrderId.toString())?.shopOrderItems || [],
            subTotal: a.order?.shopOrder?.find(so => so._id.toString() === a.shopOrderId.toString())?.subtotal || 0,
         }))
         return res.status(200).json({ assignments: formatted });
    } catch(error){
        console.error('getDeliveryBoyAssignment error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}