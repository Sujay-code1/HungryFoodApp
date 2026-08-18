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

  const handleDeliverOrder = async (order) => {
    try {
      const orderId = order?.orderId
      const shopOrderId = order?.shopOrderId

      if (!orderId || !shopOrderId) {
        setError('This assignment is missing order details.')
        return
      }

      await axios.patch(
        `${serverUrl}/api/order/${orderId}/shop-order/${shopOrderId}/status`,
        { status: 'delivered' },
        { withCredentials: true }
      )

      setOrders(prev => prev.map(item => {
        if (item.orderId === orderId && item.shopOrderId === shopOrderId) {
          return { ...item, orderStatus: 'delivered', assignmentStatus: 'completed' }
        }
        return item
      }))
      setError('')
    } catch (err) {
      console.log(err)
      setError(err.response?.data?.message || 'Could not complete delivery.')
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

        {(() => {
          const myAssignedOrders = orders.filter((item) => item.assignmentStatus === 'assigned' || item.assignmentStatus === 'completed')
          return (
            <>
              {!loading && !error && myAssignedOrders.length === 0 && (
                <div className='rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600'>
                  No delivery orders yet.
                </div>
              )}

              <div className='flex flex-col gap-3'>
                {myAssignedOrders.map((order, index) => (
                  <div key={order.orderId || index} className='rounded-2xl border border-gray-200 bg-white p-4 shadow-sm'>
                    <div className='flex items-center justify-between gap-3'>
                      <div>
                        <h2 className='font-semibold text-gray-800'>{order.shopName || 'Shop Order'}</h2>
                        <p className='mt-1 text-sm text-gray-600'>{order.deliveryAddress?.text || order.deliveryAddress || 'No address provided'}</p>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                        order.orderStatus === 'Out for delivery' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700 border-green-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className='mt-3 text-sm text-gray-700 space-y-1.5'>
                      <p><span className='font-medium'>Customer:</span> {order.customerName || 'N/A'}</p>
                      <p><span className='font-medium'>Subtotal:</span> ₹{order.subTotal || 0}</p>
                      {order.items && order.items.length > 0 && (
                        <div>
                          <p className='font-medium text-gray-800 mb-1'>Items:</p>
                          <div className='flex flex-wrap gap-1.5'>
                            {order.items.map((oi, i) => (
                              <span key={i} className='bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg border border-slate-200 font-medium'>
                                {oi.item?.name || 'Item'} × {oi.quantity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {order.orderStatus === 'Out for delivery' && (
                      <div className='mt-4 flex justify-end'>
                        <button
                          onClick={() => handleDeliverOrder(order)}
                          className='rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700'
                        >
                          Mark as Delivered
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )
        })()}
      </div>
    </div>
  )
}

export default DeliveryOrders
