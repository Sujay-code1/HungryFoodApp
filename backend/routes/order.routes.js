import express from 'express'
import isAuth from '../middlewares/isAuth.js'
import { placeOrder } from '../controllers/order.controllers.js'

const router = express.Router()

router.post('/', isAuth, placeOrder)

export default router
