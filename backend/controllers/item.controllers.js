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
        const shop = await Shop.findOne({ owner: req.userid });
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }

        const item = await Item.create({
            name,
            category,
            price,
            foodType,
            image,
            shop: shop._id,
        });

        shop.items.push(item._id);
        await shop.save();

        return res.status(201).json({ message: "Item added successfully", item });
    } catch (error) {
        res.status(500).json({message: "Error adding item"});
    }
}

export const editItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const { name, category, price, foodType } = req.body;
        const updateData = { name, category, price, foodType };

        if (req.file) {
            updateData.image = await uploadOnCloudinary(req.file.path);
        }

        const item = await Item.findByIdAndUpdate(itemId, updateData, { new: true });

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        return res.status(200).json({ message: "Item updated successfully", item });
    } catch (error) {
        res.status(500).json({ message: "Error editing item" });
    }
}

export const getItemById = async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await Item.findById(itemId).populate({ path: 'shop', populate: { path: 'owner' } });

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        if (!item.shop || String(item.shop.owner?._id) !== req.userid) {
            return res.status(403).json({ message: "Not authorized to view this item" });
        }

        return res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: "Error fetching item" });
    }
}

export const deleteItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        const shop = await Shop.findById(item.shop);
        if (!shop || String(shop.owner) !== req.userid) {
            return res.status(403).json({ message: "Not authorized to delete this item" });
        }

        await Item.findByIdAndDelete(itemId);
        const updatedShop = await Shop.findByIdAndUpdate(
            shop._id,
            { $pull: { items: item._id } },
            { new: true }
        ).populate("owner items");

        return res.status(200).json({ message: "Item deleted successfully", shop: updatedShop });
    } catch (error) {
        res.status(500).json({ message: "Error deleting item" });
    }
}


