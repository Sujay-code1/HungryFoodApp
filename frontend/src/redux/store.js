import userSlice from "./userSlice"
import shopSlice from "./shopSlice"
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
     reducer:{
        user:userSlice,
        shop:shopSlice
     }
})