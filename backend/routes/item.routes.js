import express from 'express'

import isAuth from "../middlewares/isAuth.js"
import { addItem, editItem, getItemById, deleteItem } from '../controllers/item.controllers.js';
import { upload } from "../middlewares/multer.js"

const itemRouter = express.Router();
itemRouter.post("/add-item", isAuth, upload.single("image"), addItem);
itemRouter.put("/edit-item/:id", isAuth, upload.single("image"), editItem);
itemRouter.get("/get-item/:id", isAuth, getItemById);
itemRouter.delete("/delete-item/:id", isAuth, deleteItem);
export default itemRouter;