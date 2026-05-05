import uploadOnCloudinary from "../utils/cloudinary.js";
import Shop from "../models/shop.model.js";

export const createEditShop = async (req, res) => {
  try {
    const { name, city, state, address } = req.body;
    let image;

    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    let shop = await Shop.findOne({ owner: req.userid });

    if (!shop) {
      if (!image) {
        return res.status(400).json({ message: "Shop image is required" });
      }

      shop = await Shop.create({
        name,
        city,
        state,
        address,
        image,
        owner: req.userid,
      });
    } else {
      const updateData = {
        name,
        city,
        state,
        address,
        owner: req.userid,
      };

      if (image) {
        updateData.image = image;
      }

      shop = await Shop.findByIdAndUpdate(shop._id, updateData, { new: true });
    }

    await shop.populate("owner items");
    return res.status(201).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `create shop error ${error.message || error}` });
  }
};

export const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.userid }).populate("owner items");

    if (!shop) {
      return res.status(404).json({ message: "No shop found for this owner" });
    }

    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `get my shop error ${error.message || error}` });
  }
};


export const getShopByCity = async (req, res) => {
  try {
    const { city } = req.params;
    let query = {};
    if (city && city.trim()) {
      query = { city: { $regex: new RegExp(city, "i") } };
    }
    const shops = await Shop.find(query).populate("items");
    if(!shops || shops.length === 0){
      return res.status(404).json({ message: "No shops found" });
    }
    return res.status(200).json(shops);
  } catch (error) {
    return res.status(500).json({ message: `get shopByCity error ${error.message || error}` });
  }
}

