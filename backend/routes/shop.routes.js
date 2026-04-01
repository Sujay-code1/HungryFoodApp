import express from 'express'
import { createEditShop } from '../controllers/shop.controllers.js';
import isAuth from "../middlewares/isAuth.js"


const shopRouter = express.Router();


shopRouter.get("/create-edit",isAuth, createEditShop);



export default shopRouter;