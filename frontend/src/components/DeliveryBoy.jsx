import React, { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../config'
import Nav from '../components/Nav'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import "leaflet/dist/leaflet.css"

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

function DeliveryBoy() {
  const { userData } = useSelector((state) => state.user)
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentOrder, setCurrentOrder] = useState(null)
  const [shopCoords, setShopCoords] = useState(null)
  const [customerCoords, setCustomerCoords] = useState(null)
  const mapRef = useRef(null)

  const getAssignments = async () => {
    try {
      setLoading(true)
      setError('')
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`, {
        withCredentials: true,
      })
      const fetchedAssignments = result?.data?.assignments || []
      setAssignments(fetchedAssignments)
    } catch (error) {
      console.log(error)
      setError('Unable to load delivery assignments right now.')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentOrder = async ()=>{
    try{
       const result = await axios.get(`${serverUrl}/api/order/get-current-order`, {
        withCredentials: true,
      })
      const data = result.data
      setCurrentOrder(data)

      // customer coords from API (if present)
      const custLat = data?.customerLocation?.lat || data?.customerLocation?.latitude || data?.deliveryAddress?.latitude || data?.deliveryAdress?.latitude
      const custLon = data?.customerLocation?.lon || data?.customerLocation?.longitude || data?.deliveryAddress?.longitude || data?.deliveryAdress?.longitude
      if (custLat && custLon) setCustomerCoords([custLat, custLon])

      // if API returned shop address text, try to geocode it
      const shopAddress = data?.shopOrder?.shop?.address || data?.shopOrder?.shopAddress || data?.shopName || null
      if (shopAddress) {
        const coords = await geocodeAddress(shopAddress)
        if (coords) setShopCoords([coords.lat, coords.lon])
      }
    }catch(error){
       console.log(error)
    }
  }

  const geocodeAddress = async (text) => {
    try {
      const apiKey = import.meta.env.VITE_GEOAPIKEY
      if (apiKey) {
        const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(text)}&format=json&apiKey=${apiKey}`
        const resp = await fetch(url)
        if (!resp.ok) return null
        const data = await resp.json()
        const r = data?.results?.[0] || data?.features?.[0]
        const lat = parseFloat(r?.lat || r?.y || r?.properties?.lat || r?.geometry?.coordinates?.[1])
        const lon = parseFloat(r?.lon || r?.x || r?.properties?.lon || r?.geometry?.coordinates?.[0])
        if (lat && lon) return { lat, lon }
      }

      // fallback to Nominatim
      const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=1`
      const nomResp = await fetch(nomUrl, { headers: { 'User-Agent': 'HungryFoodApp/1.0' } })
      if (!nomResp.ok) return null
      const nomData = await nomResp.json()
      const first = nomData?.[0]
      if (first) return { lat: parseFloat(first.lat), lon: parseFloat(first.lon) }
      return null
    } catch (e) {
      console.error('geocodeAddress error', e)
      return null
    }
  }

   const acceptOrder = async (assignmentId)=>{
     try{
       const result = await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`, {
        withCredentials: true,
      })
      console.log(result.data)
      getCurrentOrder()
     }catch (error){
      console.log(error)
     }
 }

  useEffect(() => {
    getCurrentOrder()
    getAssignments()
    // poll current order every 12s for live updates
    const iv = setInterval(() => {
      getCurrentOrder()
    }, 12000)
    return () => clearInterval(iv)
  }, [userData])

  

 
  return (
    <div className='w-full min-h-screen bg-[#fffaf7] pt-[90px]'>
      <Nav />
      <div className='flex flex-col items-center gap-5 px-4 py-6'>
        <div className='bg-[#f5f5f5] rounded-2xl shadow-md p-5 flex flex-col md:flex-row justify-between items-start md:items-center w-full max-w-[800px] border border-gray-300'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-12 h-12 text-lg font-bold text-white bg-orange-500 rounded-full'>
              {userData?.fullName?.charAt(0)?.toUpperCase() || 'D'}
            </div>
            <div>
              <h1 className='text-xl font-semibold text-orange-500'>Welcome, {userData?.fullName || 'Delivery Boy'}</h1>
              <p className='mt-1 text-sm text-gray-600'>Manage your assigned deliveries here.</p>
            </div>
          </div>
          <div className='flex flex-col items-start gap-2 mt-3 md:items-end md:mt-0'>
            <button
              onClick={() => navigate('/delivery-orders')}
              className='px-4 py-2 text-sm font-semibold text-white transition bg-orange-500 rounded-lg hover:bg-orange-600'
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
        {/* Current order / tracking map */}
        {currentOrder && (
          <div className='mb-4'>
            <h2 className='mb-2 text-lg font-bold text-gray-800'>Current Order Tracking</h2>
            <div className='w-full h-64 overflow-hidden border rounded-xl'>
              <MapContainer
                whenCreated={(map) => (mapRef.current = map)}
                className={'w-full h-full'}
                center={customerCoords || shopCoords || [51.505, -0.09]}
                zoom={13}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                />

                {/* Show shop first (when status is preparing/pending), then customer when Out for delivery */}
                {(() => {
                  const status = currentOrder?.shopOrder?.status || currentOrder?.shopOrder?.orderStatus
                  const showCustomer = status === 'Out for delivery' || status === 'out for delivery' || status === 'delivered'
                  return (
                    <>
                      {shopCoords && !showCustomer && (
                        <Marker position={shopCoords} />
                      )}

                      {customerCoords && showCustomer && (
                        <Marker position={customerCoords} />
                      )}

                      {/* show polyline between delivery boy and destination if coordinates available */}
                      {currentOrder?.deliveryBoyLocation && (
                        (() => {
                          const dbLat = currentOrder.deliveryBoyLocation.lat
                          const dbLon = currentOrder.deliveryBoyLocation.lon
                          const dest = showCustomer ? customerCoords : shopCoords
                          if (dbLat != null && dbLon != null && dest && dest.length === 2) {
                            return <Polyline positions={[[dbLat, dbLon], dest]} color='blue' />
                          }
                          return null
                        })()
                      )}
                    </>
                  )
                })()}
              </MapContainer>
            </div>

            <div className='mt-3 text-sm text-gray-700'>
              <p><span className='font-medium'>Shop:</span> {currentOrder?.shopOrder?.shop?.name || currentOrder?.shopName || 'N/A'}</p>
              <p><span className='font-medium'>Shop Address:</span> {currentOrder?.shopOrder?.shop?.address || currentOrder?.shopAddress || 'N/A'}</p>
              <p className='mt-1'><span className='font-medium'>Customer:</span> {currentOrder?.user?.fullName || 'Customer'}</p>
              <p><span className='font-medium'>Customer Address:</span> {currentOrder?.deliveryAddress?.text || currentOrder?.deliveryAdress?.text || currentOrder?.deliveryAddress || 'N/A'}</p>
            </div>
          </div>
        )}
        {(() => {
          const availableAssignments = assignments.filter((item) => ['broadcasted', 'assigned'].includes(item.assignmentStatus))
          return (
            <>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-lg font-bold text-gray-800'>Available Orders</h2>
                
                <span className='text-sm text-gray-500'>{availableAssignments.length} order(s)</span>
              </div>

              {loading && <p className='text-gray-600'>Loading assignments...</p>}
              {error && <p className='text-red-500'>{error}</p>}

              {!loading && !error && availableAssignments.length === 0 && (
                <p className='text-gray-600'>No delivery assignments available at the moment.</p>
              )}

              <div className='flex flex-col gap-3'>
                {availableAssignments.map((assignment, index) => (
                  <div key={assignment.orderId || index} className='p-4 bg-white border border-gray-200 shadow-sm rounded-xl'>
                    <div className='flex items-center justify-between gap-3'>
                      <div>
                        <h3 className='font-semibold text-gray-800'>{assignment.shopName || 'Shop Order'}</h3>
                        <p className='mt-1 text-sm text-gray-600'>
                          {assignment.deliveryAddress?.text || assignment.deliveryAddress || 'No address provided'}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                        assignment.orderStatus === 'preparing' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        assignment.orderStatus === 'Out for delivery' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {assignment.orderStatus}
                      </span>
                    </div>

                    <div className='mt-3 text-sm text-gray-700 space-y-1.5'>
                      <p><span className='font-medium'>Customer:</span> {assignment.customerName || 'N/A'}</p>
                      <p><span className='font-medium'>Subtotal:</span> ₹{assignment.subTotal || 0}</p>
                      {assignment.customerLocation && assignment.customerLocation.lat != null && (
                        <p><span className='font-medium'>Customer Coords:</span> {assignment.customerLocation.lat.toFixed(5)}, {assignment.customerLocation.lon.toFixed(5)}</p>
                      )}
                      {assignment.items && assignment.items.length > 0 && (
                        <div>
                          <p className='mb-1 font-medium text-gray-800'>Items:</p>
                          <div className='flex flex-wrap gap-1.5'>
                            {assignment.items.map((oi, i) => (
                              <span key={i} className='bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg border border-slate-200 font-medium'>
                                {oi.item?.name || 'Item'} × {oi.quantity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className='flex justify-end mt-4'>
                      <button
                        onClick={() => acceptOrder(assignment._id)}
                        disabled={assignment.assignmentStatus === 'assigned'}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                          assignment.assignmentStatus === 'assigned'
                            ? 'cursor-default bg-gray-500'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {assignment.assignmentStatus === 'assigned' ? 'Accepted' : 'Accept'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        })()}
      </div>
      </div>
    </div>
  )
}

export default DeliveryBoy
