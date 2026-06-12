import Order from '../models/order.model.js'
import Item from '../models/item.model.js'
import Shop from '../models/shop.model.js'

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

        return res.status(201).json({ message: 'Order placed', order })
    } catch (error) {
        console.error('Error placing order:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

