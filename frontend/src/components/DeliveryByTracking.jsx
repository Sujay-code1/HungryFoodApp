import React, { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import axios from 'axios'
import { serverUrl } from '../config'
import "leaflet/dist/leaflet.css"
import Nav from './Nav'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

function DeliveryByTracking() {
  const [currentOrder, setCurrentOrder] = useState(null)
  const [shopCoords, setShopCoords] = useState(null)
  const [customerCoords, setCustomerCoords] = useState(null)
  const mapRef = useRef(null)

  const fetchCurrentOrder = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/order/get-current-order`, { withCredentials: true })
      const data = res.data
      setCurrentOrder(data)

      if (data?.shopLocation?.lat && data?.shopLocation?.lon) {
        setShopCoords([data.shopLocation.lat, data.shopLocation.lon])
      } else if (data?.shopAddress) {
        // client-side geocode fallback (Nominatim)
        const g = await geocodeAddress(data.shopAddress)
        if (g) setShopCoords([g.lat, g.lon])
      }

      if (data?.customerLocation?.lat && data?.customerLocation?.lon) {
        setCustomerCoords([data.customerLocation.lat, data.customerLocation.lon])
      } else if (data?.deliveryAddress?.latitude && data?.deliveryAddress?.longitude) {
        setCustomerCoords([data.deliveryAddress.latitude, data.deliveryAddress.longitude])
      }
    } catch (e) {
      console.error('fetchCurrentOrder', e)
    }
  }

  useEffect(() => {
    fetchCurrentOrder()
    const iv = setInterval(fetchCurrentOrder, 10000)
    return () => clearInterval(iv)
  }, [])

  const geocodeAddress = async (text) => {
    try {
      const nom = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=1`, { headers: { 'User-Agent': 'HungryFoodApp/1.0' } })
      if (!nom.ok) return null
      const d = await nom.json()
      if (!d || !d[0]) return null
      return { lat: parseFloat(d[0].lat), lon: parseFloat(d[0].lon) }
    } catch (e) {
      console.error('geocodeAddress', e)
      return null
    }
  }

  const dest = (() => {
    const status = currentOrder?.shopOrder?.status
    const showCustomer = status === 'Out for delivery' || status === 'out for delivery' || status === 'delivered'
    return showCustomer ? customerCoords : shopCoords
  })()

  const scooterIcon = L.divIcon({
    html: `<div style="display:flex;align-items:center;justify-content:center;font-size:18px;width:36px;height:36px;border-radius:50%;background:#ff4d2d;color:#fff;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.2)">🛵</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  })

  return (
    <div className='w-full max-w-3xl mx-auto pt-[90px]'>
      <Nav />
      <h2 className='text-xl font-semibold mb-3'>Delivery Tracking</h2>

      {currentOrder ? (
        <>
          <div className='h-72 rounded-lg overflow-hidden border'>
            <MapContainer center={dest || [51.505, -0.09]} zoom={13} whenCreated={(m)=>mapRef.current = m} className='w-full h-full'>
              <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' attribution='&copy; OpenStreetMap contributors' />

              {shopCoords && (
                <Marker position={shopCoords}>
                  <Popup>
                    <div className='text-sm'>
                      <div><strong>Shop</strong></div>
                      <div>{currentOrder?.shopOrder?.shop?.name || currentOrder?.shopAddress || 'Shop'}</div>
                      <div className='text-xs text-gray-600'>{currentOrder?.shopAddress || ''}</div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {customerCoords && (
                <Marker position={customerCoords}>
                  <Popup>
                    <div className='text-sm'>
                      <div><strong>Customer</strong></div>
                      <div>{currentOrder?.deliveryAddress?.text || 'Delivery Address'}</div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {currentOrder?.deliveryBoyLocation?.lat != null && dest && (
                <>
                  <Marker position={[currentOrder.deliveryBoyLocation.lat, currentOrder.deliveryBoyLocation.lon]} icon={scooterIcon}>
                    <Popup>
                      <div className='text-sm'>
                        <div><strong>Delivery Boy</strong></div>
                        <div>Lat: {currentOrder.deliveryBoyLocation.lat.toFixed(5)}</div>
                        <div>Lon: {currentOrder.deliveryBoyLocation.lon.toFixed(5)}</div>
                      </div>
                    </Popup>
                  </Marker>

                  <Polyline positions={[[currentOrder.deliveryBoyLocation.lat, currentOrder.deliveryBoyLocation.lon], dest]} color='blue'>
                    <Tooltip sticky>Route to destination</Tooltip>
                  </Polyline>
                </>
              )}
            </MapContainer>
          </div>

          <div className='mt-3 text-sm text-gray-700'>
            <p><strong>Shop:</strong> {currentOrder?.shopOrder?.shop?.name || 'N/A'}</p>
            <p><strong>Shop Address:</strong> {currentOrder?.shopAddress || currentOrder?.shopOrder?.shop?.address || 'N/A'}</p>
            <p className='mt-1'><strong>Customer:</strong> {currentOrder?.user?.fullName || 'Customer'}</p>
            <p><strong>Delivery Address:</strong> {currentOrder?.deliveryAddress?.text || 'N/A'}</p>
          </div>
        </>
      ) : (
        <p>Loading current order...</p>
      )}
    </div>
  )
}

export default DeliveryByTracking
