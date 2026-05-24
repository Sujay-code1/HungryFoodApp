import {createSlice} from "@reduxjs/toolkit"
const mapSlice = createSlice({
    name:"map",
    initialState:{
      location:{
         lon:null,
       lat:null
      },
      address:null
    },
    reducers:{
        setLocation:(state, action)=>{
            const{lon, lat} = action.payload
            state.location.lon = lon
            state.location.lat = lat
        },

        setAddress:(state, action)=>{
            state.address = action.payload
        }
    }        
})


export const {setAddress, setLocation} = mapSlice.actions
export default mapSlice.reducer