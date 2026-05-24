import userSlice from "./userSlice"
import shopSlice from "./shopSlice"
import mapSlice from "./mapSlice"
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
     reducer:{
        user:userSlice,
        shop:shopSlice,
        map:mapSlice
     }
})