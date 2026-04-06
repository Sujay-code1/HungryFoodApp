import { createSlice } from "@reduxjs/toolkit";

const shopSlice = createSlice({
    name:"Owner",
    initialState:{
         myShopData:null
        
    },

    reducers:{
        setMyShopData:(state, action)=>{
            state.myShopData = action.payload
        }
    }
})

export const {setMyShopData} = shopSlice.actions
export default shopSlice.reducer