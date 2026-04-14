import {createSlice} from "@reduxjs/toolkit"
const userSlice = createSlice({
    name:"user",
    initialState:{
        userData:null,
        city:null,
        state:null
    },
    reducers:{
        setUserData:(state, action)=>{
            state.userData=action.payload
        },
        setLocation:(state, action)=>{
            state.city=action.payload.city
            state.state=action.payload.state
        }
    }
})


export const {setUserData, setLocation} = userSlice.actions
export default userSlice.reducer