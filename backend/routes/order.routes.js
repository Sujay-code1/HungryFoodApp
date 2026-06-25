import express from 'express'
import isAuth from '../middlewares/isAuth.js'
import { placeOrder, getUserOrders, getOwnerOrders, updateShopOrderStatus } from '../controllers/order.controllers.js'

const router = express.Router()

router.post('/place-order', isAuth, placeOrder)
router.get('/user-orders', isAuth, getUserOrders)
router.get('/owner-orders', isAuth, getOwnerOrders)
router.patch('/:orderId/shop-order/:shopOrderId/status', isAuth, updateShopOrderStatus)

export default router
