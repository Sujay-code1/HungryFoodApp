import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../config'
import { IoArrowBackOutline } from 'react-icons/io5'

function DeliveryOrders() {
  const navigate = useNavigate()
  const { userData } = useSelector((state) => state.user)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError('')
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`, {
        withCredentials: true,
      })
      setOrders(result?.data?.assignments || [])
    } catch (err) {
      console.log(err)
      setError('Unable to load your delivery orders right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [userData])

  return (
    <div className='min-h-screen bg-[#fffaf7] px-4 py-4 pt-6'>
      <div className='mx-auto max-w-3xl'>
        <div className='mb-4 flex items-center gap-3'>
          <button
            onClick={() => navigate('/delivery-boy')}
            className='rounded-2xl p-2.5 text-gray-600 transition hover:bg-gray-100'
          >
            <IoArrowBackOutline size={20} />
          </button>
          <div>
            <h1 className='text-xl font-bold text-gray-900'>My Delivery Orders</h1>
            <p className='text-sm text-gray-500'>Orders assigned to you</p>
          </div>
        </div>

        {loading && <p className='text-gray-600'>Loading your orders...</p>}
        {error && <p className='text-red-500'>{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div className='rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600'>
            No delivery orders yet.
          </div>
        )}

        <div className='flex flex-col gap-3'>
          {orders.map((order, index) => (
            <div key={order.orderId || index} className='rounded-2xl border border-gray-200 bg-white p-4 shadow-sm'>
              <div className='flex items-center justify-between gap-3'>
                <div>
                  <h2 className='font-semibold text-gray-800'>{order.shopName || 'Shop Order'}</h2>
                  <p className='mt-1 text-sm text-gray-600'>{order.deliveryAddress?.text || order.deliveryAddress || 'No address provided'}</p>
                </div>
                <span className='rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600'>Assigned</span>
              </div>
              <div className='mt-3 text-sm text-gray-700'>
                <p><span className='font-medium'>Items:</span> {order.items?.length || 0}</p>
                <p><span className='font-medium'>Subtotal:</span> ₹{order.subTotal || 0}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DeliveryOrders
