import uploadOnCloudinary from "../utils/cloudinary.js";
import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";

export const addItem = async (req, res)=>{ 
    try {
        const{name, category, price, foodType}  = req.body;
        let image ;
        if(req.file){
            image = await uploadOnCloudinary(req.file.path)
        }
        const shop = await Shop.findOne({owner: req.user._id});
        if(!shop){
            return res.status(404).json({message: "Shop not found"});
        }
        const item =  await Item.create({
            name,
            category,
            price,
            foodType,
            image,
            shop: shop._id
        })

        return res.status(201).json({message: "Item added successfully", item});
    } catch (error) {
        res.status(500).json({message: "Error adding item"});
    }
}

export const editItem = async(req, res)=>{
    try {
        const itemId = req.params.id;
        const{name, category, price, foodType}  = req.body;
        let image ;
        if(req.file){
            image = await uploadOnCloudinary(req.file.path)
        }

        const item = await Item.findByIdAndUpdate(itemId, {
            name,category,price,foodType,image
        },{new: true});

        if(!item){
            return res.status(404).json({message: "Item not found"});
        }

       
    } catch (error) {
        res.status(500).json({message: "Error editing item"});
    }
}


