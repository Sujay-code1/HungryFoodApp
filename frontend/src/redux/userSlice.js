import {createSlice} from "@reduxjs/toolkit"
const userSlice = createSlice({
    name:"user",
    initialState:{
        userData:null,
        city:null,
        state:null,
        shopInMyCity:null
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
        }
    }
})


export const {setUserData, setLocation, setShopInMyCity} = userSlice.actions
export default userSlice.reducer