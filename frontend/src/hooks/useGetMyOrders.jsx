import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useRef } from 'react'
import axios from 'axios'
import { serverUrl } from '../config'
import { setMyOrders } from '../redux/userSlice'

function useGetMyOrders() {
  const dispatch = useDispatch()
  const { userData, myOrders } = useSelector(state => state.user)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!userData) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    const fetchOrders = async () => {
      try {
        const endpoint = userData.role === 'owner'
          ? `${serverUrl}/api/order/owner-orders`
          : `${serverUrl}/api/order/user-orders`
        const result = await axios.get(endpoint, { withCredentials: true })
        dispatch(setMyOrders(result.data))
      } catch (error) {
        console.error('Error fetching orders:', error)
      }
    }

    // Initial fetch
    fetchOrders()

    // Determine if there are active orders to poll for (for both user and owner)
    // Active statuses are: pending, preparing, Out for delivery
    const hasActiveOrders = myOrders?.some(order => 
      order.shopOrder?.some(so => 
        ['pending', 'preparing', 'Out for delivery'].includes(so.status)
      )
    )

    // Poll every 5 seconds if there are active orders
    if (hasActiveOrders || !myOrders) {
      timerRef.current = setInterval(fetchOrders, 5000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [userData, myOrders === null]) // Trigger refetch on login state or initial null load

  // Also manage polling dynamically when orders update
  useEffect(() => {
    if (!userData || !myOrders) return

    const fetchOrders = async () => {
      try {
        const endpoint = userData.role === 'owner'
          ? `${serverUrl}/api/order/owner-orders`
          : `${serverUrl}/api/order/user-orders`
        const result = await axios.get(endpoint, { withCredentials: true })
        dispatch(setMyOrders(result.data))
      } catch (error) {
        console.error('Error in poll fetch:', error)
      }
    }

    const hasActiveOrders = myOrders.some(order => 
      order.shopOrder?.some(so => 
        ['pending', 'preparing', 'Out for delivery'].includes(so.status)
      )
    )

    if (hasActiveOrders) {
      if (!timerRef.current) {
        timerRef.current = setInterval(fetchOrders, 5000)
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      // Don't clear here to keep the interval going across renders unless dependencies change
    }
  }, [myOrders, userData])
}

export default useGetMyOrders