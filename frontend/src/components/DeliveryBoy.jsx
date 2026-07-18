import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../config'
import Nav from '../components/Nav'
import { useNavigate } from 'react-router-dom'

function DeliveryBoy() {
  const { userData } = useSelector((state) => state.user)
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const getAssignments = async () => {
    try {
      setLoading(true)
      setError('')
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`, {
        withCredentials: true,
      })
      const fetchedAssignments = result?.data?.assignments || []
      setAssignments(fetchedAssignments)
    } catch (err) {
      console.log(err)
      setError('Unable to load delivery assignments right now.')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptAssignment = async (assignment) => {
    try {
      const orderId = assignment?.orderId
      const shopOrderId = assignment?.shopOrderId

      if (!orderId || !shopOrderId) {
        setError('This assignment is missing order details.')
        return
      }

      await axios.patch(
        `${serverUrl}/api/order/${orderId}/shop-order/${shopOrderId}/status`,
        { status: 'Out for delivery' },
        { withCredentials: true }
      )

      setAssignments((prev) => prev.filter((item) => item.orderId !== orderId || item.shopOrderId !== shopOrderId))
      setError('')
    } catch (err) {
      console.log(err)
      setError(err.response?.data?.message || 'Could not accept this assignment.')
    }
  }

  useEffect(() => {
    getAssignments()
  }, [userData])

  return (
    <div className='w-full min-h-screen bg-[#fffaf7] pt-[90px]'>
      <Nav />
      <div className='flex flex-col gap-5 items-center px-4 py-6'>
        <div className='bg-[#f5f5f5] rounded-2xl shadow-md p-5 flex flex-col md:flex-row justify-between items-start md:items-center w-full max-w-[800px] border border-gray-300'>
          <div className='flex items-center gap-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-lg font-bold text-white'>
              {userData?.fullName?.charAt(0)?.toUpperCase() || 'D'}
            </div>
            <div>
              <h1 className='text-xl text-orange-500 font-semibold'>Welcome, {userData?.fullName || 'Delivery Boy'}</h1>
              <p className='text-sm text-gray-600 mt-1'>Manage your assigned deliveries here.</p>
            </div>
          </div>
          <div className='flex flex-col md:items-end items-start gap-2 mt-3 md:mt-0'>
            <button
              onClick={() => navigate('/delivery-orders')}
              className='rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600'
            >
              My Orders
            </button>
            <div className='text-sm text-gray-600'>
              <p>Latitude: {userData?.location?.coordinates?.[1] ?? 'N/A'}</p>
              <p>Longitude: {userData?.location?.coordinates?.[0] ?? 'N/A'}</p>
            </div>
          </div>
        </div>

      <div className='bg-[#f5f5f5] rounded-2xl shadow-md p-5 w-full max-w-[800px] border border-gray-300'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-bold text-gray-800'>Available Orders</h2>
          <span className='text-sm text-gray-500'>{assignments.length} order(s)</span>
        </div>

        {loading && <p className='text-gray-600'>Loading assignments...</p>}
        {error && <p className='text-red-500'>{error}</p>}

        {!loading && !error && assignments.length === 0 && (
          <p className='text-gray-600'>No delivery assignments available at the moment.</p>
        )}

        <div className='flex flex-col gap-3'>
          {assignments.map((assignment, index) => (
            <div key={assignment.orderId || index} className='border border-gray-200 rounded-xl p-4 bg-white shadow-sm'>
              <div className='flex items-center justify-between gap-3'>
                <div>
                  <h3 className='font-semibold text-gray-800'>{assignment.shopName || 'Shop Order'}</h3>
                  <p className='text-sm text-gray-600 mt-1'>
                    {assignment.deliveryAddress?.text || assignment.deliveryAddress || 'No address provided'}
                  </p>
                </div>
                <span className='bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full'>New</span>
              </div>

              <div className='mt-3 text-sm text-gray-700'>
                <p><span className='font-medium'>Customer:</span> {assignment.customerName || 'N/A'}</p>
                <p><span className='font-medium'>Items:</span> {assignment.items?.length ? assignment.items.length : 0}</p>
                <p><span className='font-medium'>Subtotal:</span> ₹{assignment.subTotal || 0}</p>
              </div>

              <div className='mt-4 flex justify-end'>
                <button
                  onClick={() => handleAcceptAssignment(assignment)}
                  className='rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700'
                >
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  )
}

export default DeliveryBoy
