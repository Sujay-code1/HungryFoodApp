
import React from 'react'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../config'
import { setMyOrders } from '../redux/userSlice'

 function useGetMyOrders(){
   const dispatch = useDispatch()
   const {userData} = useSelector(state => state.user)

   useEffect(()=>{
    if (!userData) return;

    const fetchOrders = async()=>{
        try {
            const endpoint = userData.role === 'owner'
                ? `${serverUrl}/api/order/owner-orders`
                : `${serverUrl}/api/order/user-orders`
            const result = await axios.get(endpoint, {withCredentials:true})
            dispatch(setMyOrders(result.data))
        } catch (error) {
            console.log(error)
        }
    }
     fetchOrders()
   },[userData])
}

export default useGetMyOrders;