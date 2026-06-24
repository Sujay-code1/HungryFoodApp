
import React, { useEffect, useRef, useState } from 'react'
import { IoArrowBackOutline } from "react-icons/io5";
import { CiLocationOn } from "react-icons/ci";
import { GoSearch } from "react-icons/go";
import { MdOutlineMyLocation } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import {useSelector, useDispatch} from 'react-redux'
import CartItemCard from '../components/CartItemCard'
import useGetCity from '../hooks/useGetCity';
import axios from 'axios'
import { setLocation, setAddress } from '../redux/mapslice'
import { toast } from 'react-toastify'
import { clearCart } from '../redux/userSlice'
import "leaflet/dist/leaflet.css"
import { MdDeliveryDining } from "react-icons/md";
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { CiMobile3 } from "react-icons/ci";
import { CiCreditCard1 } from "react-icons/ci";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function RecenterOnLocation({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && map) map.setView(center);
  }, [center, map]);
  return null;
}

function DraggableMarker({ position, onDragEnd }) {
  const markerRef = useRef(null);
  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const latlng = marker.getLatLng ? marker.getLatLng() : marker._latlng;
        onDragEnd({ lat: latlng.lat, lon: latlng.lng });
      }
    },
  };
  return <Marker ref={markerRef} position={position} draggable eventHandlers={eventHandlers} />;
}

function CheckOut() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const {location, address} = useSelector(state=>state.map)
  const { cartItems = [], totalAmount = 0 } = useSelector(state => state.user)
  const [query, setQuery] = useState(address || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [placingOrder, setPlacingOrder] = useState(false)
  const hasValidLocation = location?.lat != null && location?.lon != null
  const mapCenter = hasValidLocation ? [location.lat, location.lon] : [51.505, -0.09]

  // Fees configuration
  const DELIVERY_CHARGE = 30 // flat delivery charge
  const PLATFORM_FEE_PERCENT = 0.02 // 2% platform fee
  const GST_PERCENT = 0.05 // 5% GST

  const subtotal = Number(totalAmount) || 0
  const platformFee = +(subtotal * PLATFORM_FEE_PERCENT)
  const deliveryCharge = DELIVERY_CHARGE
  const gst = +((subtotal + deliveryCharge + platformFee) * GST_PERCENT)
  const grandTotal = +(subtotal + deliveryCharge + platformFee + gst)

  useEffect(() => {
    setQuery(address || '')
  }, [address])

  const onMarkerDragEnd = ({lat, lon}) => {
    dispatch(setLocation({ lon, lat }))
  }

  const apiKey = import.meta.env.VITE_GEOAPIKEY

  const formatGeoapifyAddress = (result) => {
    if (!result) return ''
    const stringValue = (value) => typeof value === 'string' && value.trim() ? value.trim() : ''
    const addressObj = result.address || result.properties?.address
    const objAddress = addressObj && typeof addressObj === 'object'
      ? [addressObj.house_number, addressObj.road, addressObj.suburb, addressObj.city, addressObj.state, addressObj.postcode, addressObj.country].filter(Boolean).join(', ')
      : ''

    return stringValue(result.formatted)
      || stringValue(result.formatted_address)
      || stringValue(result.address)
      || stringValue(result.properties?.formatted)
      || stringValue(result.properties?.formatted_address)
      || stringValue(result.properties?.address_line1)
      || stringValue(result.properties?.address_line2)
      || objAddress
      || stringValue(result.display_name)
      || stringValue(result.name)
      || ''
  }

  const getGeoapifyResult = (data) => {
    return data?.results?.[0] || data?.features?.[0] || null
  }

  const handleSearch = async () => {
    if (!query) return
    if (!apiKey) {
      setError('Missing Geoapify API key')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&format=json&apiKey=${apiKey}`
      const geoResp = await fetch(geoUrl)
      if (!geoResp.ok) throw new Error('Geoapify network response not ok')
      const geoData = await geoResp.json()
      const result = getGeoapifyResult(geoData)
      if (!result) throw new Error('No results')
      const lat = parseFloat(result.lat || result.y || result.properties?.lat || result.geometry?.coordinates?.[1])
      const lon = parseFloat(result.lon || result.x || result.properties?.lon || result.geometry?.coordinates?.[0])
      const formatted = formatGeoapifyAddress(result)
      if (lat && lon) {
        dispatch(setLocation({ lon, lat }))
        dispatch(setAddress(formatted))
        setQuery(formatted)
      } else {
        throw new Error('Invalid coordinates from geocoding')
      }
    } catch (err) {
      console.error(err)
      setError('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const reverseGeocodeWithNominatim = async (latitude, longitude) => {
    try {
      const resp = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'jsonv2'
        },
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'HungryFoodApp/1.0'
        }
      })
      const data = resp?.data || {}
      return data.display_name || data.name || data.address?.road || data.address?.city || data.address?.county || ''
    } catch (e) {
      console.error('Nominatim fallback failed:', e)
      return ''
    }
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }
    if (!apiKey) {
      setError('Missing Geoapify API key')
      return
    }
    setLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords
      const fallbackAddress = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
      let finalAddress = ''
      try {
        const geoUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
        const geoResp = await fetch(geoUrl)
        if (!geoResp.ok) throw new Error('Geoapify network response not ok')
        const geoData = await geoResp.json()
        const result = getGeoapifyResult(geoData)
        finalAddress = formatGeoapifyAddress(result)
        if (!finalAddress) {
          finalAddress = await reverseGeocodeWithNominatim(latitude, longitude)
        }
        if (!finalAddress) {
          finalAddress = fallbackAddress
          setError('Location found; using coordinates because address lookup returned no address')
        } else {
          setError(null)
        }
      } catch (err) {
        console.error('Geoapify reverse geocode error:', err)
        finalAddress = await reverseGeocodeWithNominatim(latitude, longitude)
        if (!finalAddress) {
          finalAddress = fallbackAddress
          const status = err?.response?.status
          if (status === 401 || status === 403) {
            setError('Geoapify key invalid or quota exceeded; using coordinates instead')
          } else {
            setError('Geoapify reverse geocoding failed; using coordinates instead')
          }
        } else {
          setError(null)
        }
      }
      dispatch(setLocation({ lon: longitude, lat: latitude }))
      dispatch(setAddress(finalAddress))
      setQuery(finalAddress)
      setLoading(false)
    }, (err) => {
      console.error(err)
      setError('Failed to get current location')
      setLoading(false)
    })
  }

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return
    setPlacingOrder(true)
    try {
      const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'
      const payload = {
        cartItems: cartItems.map(i => ({ itemId: i.id, quantity: i.quantity })),
        paymentMethod,
        deliveryAddress: {
          text: query || address || '',
          latitude: location?.lat,
          longitude: location?.lon,
        }
      }

      await axios.post(`${API_URL}/api/order/place-order`, payload, { withCredentials: true })
      dispatch(clearCart())
      toast.success('Order placed successfully!')
      navigate('/order-placed')
    } catch (err) {
      console.error(err)
      toast.error('Failed to place order')
    } finally {
      setPlacingOrder(false)
    }
  }
  return (
    <div className='flex items-center justify-center min-h-screen px-4 py-6 bg-gray-100'>
      <div className='z-[10] absolute top-4 left-4 sm:top-5 sm:left-5' onClick={() => navigate("/")}>
        <IoArrowBackOutline size={28} className='text-gray-700 cursor-pointer' />
      </div>

      <div className='w-full max-w-[900px] bg-white rounded-3xl shadow-xl p-6 md:p-8 space-y-6'>
        <h1 className='text-2xl font-bold text-gray-800 sm:text-3xl'>Checkout</h1>

        <section>
          <h2 className='flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800 sm:text-xl'>
            <CiLocationOn size={28} className='text-red-500' />
            Delivery Location
          </h2>

          <div className='flex flex-col gap-3 mb-2 sm:flex-row sm:items-center'>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type='text'
              placeholder='Enter your delivery address'
              className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
            />

            <div className='flex gap-2 sm:gap-3 sm:shrink-0'>
              <button type='button' onClick={handleSearch} disabled={loading} className='w-full px-4 py-3 text-white transition-colors bg-red-500 rounded-lg sm:w-auto hover:bg-red-600'>
                <GoSearch size={18} />
              </button>
              <button type='button' onClick={handleUseMyLocation} disabled={loading} className='w-full px-4 py-3 text-white transition-colors bg-blue-500 rounded-lg sm:w-auto hover:bg-blue-600'>
                <MdOutlineMyLocation size={18} />
              </button>
            </div>
          </div>
          {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}

           <div className='overflow-hidden border rounded-xl'>
                   <div className='flex items-center justify-center w-full h-64'>
                      <MapContainer
                        className={"w-full h-full"}
                        center={location?.lat && location?.lon ? [location.lat, location.lon] : [51.505, -0.09]}
                        zoom={13}
                        scrollWheelZoom={false}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <RecenterOnLocation center={mapCenter} />
                        <DraggableMarker
                          position={mapCenter}
                          onDragEnd={onMarkerDragEnd}
                        />
                      </MapContainer>
                   </div>
                   </div>
        </section>

        <section>
           <h2 className='mb-3 text-lg font-semibold text-gray-800 '>Payment Method</h2>
           <div className= 'grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className = {`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${paymentMethod === 'cod' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-100'}`} onClick={()=> setPaymentMethod('cod')}>
                <span className="inline-flex items-center justify-center w-10 h-10 bg-green-100 rounded-full"><MdDeliveryDining  /></span>
                <div>
                  <h3 className='font-medium text-gray-800'>Cash on Delivery</h3>
                  <p className='text-sm text-gray-600'>Pay with cash upon delivery</p>
                </div>
              </div>

              <div className = {`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${paymentMethod === 'card' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-100'}`} onClick={()=> setPaymentMethod('online')}>
                  <span className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
                    <CiMobile3 />
                  </span>
                  
                  <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                    <CiCreditCard1 />
                  </span>
                  <div>
                    <h3 className='font-medium text-gray-800'>UPI / Credit Card / Debit Card</h3>
                    <p className='text-sm text-gray-600'>Pay securely online</p>
                  </div>
              </div>
            
           </div>
        </section>

        <section>
          <h2 className='text-lg font-semibold text-gray-800'>Order Summary</h2>
          <div className='flex flex-col p-4 mt-2 border rounded-lg bg-gray-50'>
              {cartItems.length === 0 ? (
                <p className='text-gray-600'>Your cart is empty</p>
              ) : (
                <>
                  <div className='pr-2 space-y-2 overflow-y-auto max-h-64'>
                    {cartItems.map((item) => (
                      <CartItemCard key={item.id} data={item} />
                    ))}
                  </div>

                  <div className='pt-4 mt-4 space-y-2 border-t'>
                    <div className='flex items-center justify-between text-sm text-gray-600'>
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>

                    <div className='flex items-center justify-between text-sm text-gray-600'>
                      <span>Delivery Charges</span>
                      <span>₹{deliveryCharge.toFixed(2)}</span>
                    </div>

                    <div className='flex items-center justify-between text-sm text-gray-600'>
                      <span>Platform Fee ({(PLATFORM_FEE_PERCENT * 100).toFixed(0)}%)</span>
                      <span>₹{platformFee.toFixed(2)}</span>
                    </div>

                    <div className='flex items-center justify-between text-sm text-gray-600'>
                      <span>GST ({(GST_PERCENT * 100).toFixed(0)}%)</span>
                      <span>₹{gst.toFixed(2)}</span>
                    </div>

                    <div className='flex items-center justify-between pt-2 mt-2 border-t'>
                      <span className='text-lg font-semibold'>Grand Total</span>
                      <span className='text-lg font-bold'>₹{grandTotal.toFixed(2)}</span>
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={placingOrder || cartItems.length === 0}
                      className={`w-full mt-4 px-4 py-3 text-white rounded-lg ${placingOrder || cartItems.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                      {placingOrder ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </>
              )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default CheckOut;
