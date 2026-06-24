import mongoose from 'mongoose'

const shopOrderItemsSchema = new mongoose.Schema({
    item: {type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true},
    price: Number,
    quantity:Number,
}, {timestamps:true})


const shopOrderSchema = new mongoose.Schema({
       shop: {type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
       },

       owner:{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},

       subtotal: Number,

       shopOrderItems: [shopOrderItemsSchema],

       status:{
        type: String, 
        enum:["pending","preparing", "Out for delivery", "delivered", "cancelled"],
        default: "pending"
       }



},{timestamps:true})


const orderSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },

    paymentMethod: {
        type: String, 
         enum:["cod", "online" ],
         required: true
    },

    deliveryAddress: {
        type: {
            text: String,
            longitude: Number,
            latitude: Number,
        },
        required: true,
    },

    totalAmount: {
        type: Number,

    },

    shopOrder: [shopOrderSchema]


   
}, {timestamps:true})


const Order = mongoose.model("Order", orderSchema)

export default Order;