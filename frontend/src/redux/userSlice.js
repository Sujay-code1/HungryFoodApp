import {createSlice} from "@reduxjs/toolkit"
const userSlice = createSlice({
    name:"user",
    initialState:{
        userData:null,
        city:null,
        state:null,
        shopInMyCity:null,
        cartItems:[],
        totalAmount:0,
        myOrders:null
    },
    reducers:{
        setUserData:(state, action)=>{
            state.userData=action.payload
        },
        setLocation:(state, action)=>{
            state.city=action.payload.city
            state.state=action.payload.state
        },

        setShopInMyCity:(state, action)=>{
            state.shopInMyCity=action.payload
        },

        addToCart:(state, action)=>{
           const cartItem = action.payload
           const existing = state.cartItems.find(i => i.id === cartItem.id)
           if(existing){
           existing.quantity += cartItem.quantity
           }else{
            state.cartItems.push(cartItem)
           }
           state.totalAmount = state.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
        },

        removeFromCart:(state, action)=>{
            state.cartItems = state.cartItems.filter(item => item.id !== action.payload)
            state.totalAmount = state.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
        },

        updateCartItemQuantity:(state, action)=>{
            const { id, quantity } = action.payload
            const item = state.cartItems.find(item => item.id === id)
            if(item){
                if(quantity <= 0){
                    state.cartItems = state.cartItems.filter(item => item.id !== id)
                    state.totalAmount = state.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
                }else{
                    item.quantity = quantity
                    state.totalAmount = state.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
                }
            }
        },

        clearCart:(state)=>{
            state.cartItems = []
            state.totalAmount = 0
        },

        setMyOrders:(state, action)=>{
            state.myOrders=action.payload
        }
    }
})


export const {setUserData, setLocation, setShopInMyCity, addToCart, removeFromCart, updateCartItemQuantity, clearCart, setMyOrders} = userSlice.actions
export default userSlice.reducer