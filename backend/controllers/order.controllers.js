import Order from '../models/order.model.js'
import Item from '../models/item.model.js'
import Shop from '../models/shop.model.js'
import User from '../models/user.model.js'
import DeliveryAssignment from '../models/deliveryAssignment.model.js'
import axios from 'axios'

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

    const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        broadcastedTo: candidateBoys.map(b => b._id),
        assignedTo: null,
        status: 'broadcasted',
        assignedAt: null,
    })

    shopOrder.assignment = deliveryAssignment._id

    return {
        deliveryAssignment,
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
        const currentUserId = req.userid;
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

        const isOwner = shopOrder.owner?.toString() === currentUserId?.toString();
        let assignment = null;

        if (shopOrder.assignment) {
            assignment = await DeliveryAssignment.findById(shopOrder.assignment);
        }

        const isDeliveryBoyForAssignment = Boolean(
            assignment && assignment.broadcastedTo?.some((id) => id?.toString() === currentUserId?.toString())
        );

        if (!isOwner && !isDeliveryBoyForAssignment) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        shopOrder.status = status;
        let deliveryBoyPayload = [];

        if (status === 'Out for delivery' || status === 'preparing') {
            if (isOwner) {
                if (!shopOrder.assignment) {
                    const assignmentResult = await assignDeliveryBoyToShopOrder(order, shopOrder)

                    if (assignmentResult) {
                        deliveryBoyPayload = assignmentResult.deliveryBoys
                        assignment = assignmentResult.deliveryAssignment
                    }
                }
            }
        }

        if (status === 'Out for delivery') {
            if (!isOwner && assignment) {
                assignment.status = 'assigned';
                assignment.assignedTo = currentUserId;
                assignment.assignedAt = new Date();
                await assignment.save();
                shopOrder.assignedDeliveryBoy = currentUserId;
            }
        }

        if (status === 'delivered') {
            if (assignment) {
                assignment.status = 'completed';
                await assignment.save();
            }
        }

        await order.save();

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
            $or: [
                { broadcastedTo: deliveryBoyId, status: 'broadcasted' },
                { assignedTo: deliveryBoyId, status: 'assigned' }
            ]
         })
         .populate({
            path: 'order',
            populate: [
               { path: 'user', select: 'fullName email mobile' },
               { path: 'shopOrder.shopOrderItems.item', select: 'name price image' }
            ]
         })
         .populate("shop", "name")

         const formatted = assignments.map(a => {
            const shopOrder = a.order?.shopOrder?.find(so => so._id && a.shopOrderId && so._id.toString() === a.shopOrderId.toString());
            // include numeric customer coordinates if available to avoid client-side geocoding
            const custLat = a.order?.deliveryAddress?.latitude ?? null
            const custLon = a.order?.deliveryAddress?.longitude ?? null
            // include assigned delivery boy location if assigned
            let assignedDeliveryBoyLocation = null
            if (a.assignedTo && a.assignedTo.location && a.assignedTo.location.coordinates && a.assignedTo.location.coordinates.length === 2) {
                assignedDeliveryBoyLocation = {
                    lat: a.assignedTo.location.coordinates[1],
                    lon: a.assignedTo.location.coordinates[0]
                }
            }

                return {
                    _id: a._id,
                    orderId: a.order?._id?.toString(),
                    shopOrderId: a.shopOrderId?.toString(),
                    shopName: a.shop?.name,
                    customerName: a.order?.user?.fullName || 'Customer',
                    deliveryAddress: a.order?.deliveryAddress?.text || a.order?.deliveryAddress || 'No address provided',
                    customerLocation: { lat: custLat, lon: custLon },
                    assignedDeliveryBoyLocation,
                    items: shopOrder?.shopOrderItems || [],
                    subTotal: shopOrder?.subtotal || 0,
                    orderStatus: shopOrder?.status || 'pending',
                    assignmentStatus: a.status
                };
         })
         return res.status(200).json({ assignments: formatted });
    } catch(error){
        console.error('getDeliveryBoyAssignment error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const acceptOrder = async (req, res)=>{
    try {
        const { assignmentId } = req.params
        const assignment = await DeliveryAssignment.findById(assignmentId)
        if (!assignment) return res.status(400).json({ message: 'No assignment received' })
        if (assignment.status !== 'broadcasted') return res.status(400).json({ message: 'assignment expired' })

        const deliveryBoyId = req.userid
        const alreadyAssigned = await DeliveryAssignment.findOne({
            assignedTo: deliveryBoyId,
            status: { $nin: ['broadcasted', 'completed'] }
        })
        if (alreadyAssigned) return res.status(400).json({ message: 'You are already assigned to another order' })

        assignment.assignedTo = deliveryBoyId
        assignment.status = 'assigned'
        assignment.assignedAt = new Date()
        await assignment.save()

        const order = await Order.findById(assignment.order)
        if (!order) return res.status(400).json({ message: 'order not found' })

        const shopOrder = order.shopOrder.id(assignment.shopOrderId)
        if (shopOrder) {
            shopOrder.assignedDeliveryBoy = deliveryBoyId
            shopOrder.assignment = assignment._id
        }

        await order.save()
        await order.populate('shopOrder.assignedDeliveryBoy')

        return res.status(200).json({ message: 'Order accepted successfully', assignment, order })
    } catch (error) {
        console.error('acceptOrder error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const getCurrentOrder = async (req, res) => {
    try {
        const deliveryBoyId = req.userid
        if (!deliveryBoyId) return res.status(401).json({ message: 'Unauthorized' })

        const assignment = await DeliveryAssignment.findOne({
            assignedTo: deliveryBoyId,
            status: 'assigned'
        })
            .populate('shop', 'name address city state')
            .populate('assignedTo', 'fullName email mobile location')
            .populate({
                path: 'order',
                populate: [{ path: 'user', select: 'fullName email mobile' }]
            })

        if (!assignment) return res.status(400).json({ message: 'assignment not found' })
        if (!assignment.order) return res.status(400).json({ message: 'order not found' })

        const shopOrder = assignment.order.shopOrder.find(so => so._id.toString() === assignment.shopOrderId.toString())
        if (!shopOrder) return res.status(400).json({ message: 'shop order not found' })

        // delivery boy location
        let deliveryBoyLocation = { lat: null, lon: null }
        if (assignment.assignedTo?.location?.coordinates && assignment.assignedTo.location.coordinates.length === 2) {
            deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1]
            deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0]
        }

        // customer location
        let customerLocation = { lat: null, lon: null }
        if (assignment.order?.deliveryAddress) {
            customerLocation.lat = assignment.order.deliveryAddress.latitude || null
            customerLocation.lon = assignment.order.deliveryAddress.longitude || null
        }

        // shop address and geocode (if possible)
        const shop = assignment.shop || null
        let shopAddress = shop?.address || null
        let shopLocation = { lat: null, lon: null }
        if (shopAddress) {
            try {
                const nomRes = await axios.get('https://nominatim.openstreetmap.org/search', {
                    params: { q: shopAddress, format: 'json', limit: 1 },
                    headers: { 'User-Agent': 'HungryFoodApp/1.0' }
                })
                const first = nomRes.data?.[0]
                if (first) {
                    shopLocation.lat = parseFloat(first.lat)
                    shopLocation.lon = parseFloat(first.lon)
                }
            } catch (e) {
                console.warn('Shop geocode failed', e.message || e)
            }
        }

        return res.status(200).json({
            _id: assignment._id,
            user: assignment.order.user,
            shopOrder,
            deliveryAddress: assignment.order.deliveryAddress,
            deliveryBoyLocation,
            customerLocation,
            shopAddress,
            shopLocation
        })
    } catch (error) {
        console.error('getCurrentOrder error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}


