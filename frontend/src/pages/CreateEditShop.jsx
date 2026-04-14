import React, { useEffect, useState } from 'react'
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaUtensils } from "react-icons/fa";
import axios from 'axios';
import { serverUrl } from '../config';
import { toast } from 'react-toastify';
import { setMyShopData } from '../redux/shopSlice';

const inputClass =
  'border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full transition-colors duration-200'

const MAX_IMAGE_SIZE_MB = 5

function CreateEditShop() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { myShopData } = useSelector(state => state.shop)

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)

  // Only pre-fill in Edit mode — never assume location for new shops
  useEffect(() => {
    if (myShopData) {
      setName(myShopData.name || '')
      setAddress(myShopData.address || '')
      setSelectedState(myShopData.state || '')
      setSelectedCity(myShopData.city || '')
      // Pre-fill existing shop image preview in edit mode
      setImagePreview(
        myShopData.imageUrl
          ? myShopData.imageUrl.startsWith('http')
            ? myShopData.imageUrl                        // Cloudinary / S3 full URL
            : `${serverUrl}${myShopData.imageUrl}`      // relative path from your server
          : null
      )
    }
  }, [myShopData])

  // Cleanup blob URL on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const handleStateChange = (e) => {
    setSelectedState(e.target.value)
    setSelectedCity('') // Reset city whenever state changes
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      setImageFile(null)
      setImagePreview(null)
      return
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_IMAGE_SIZE_MB}MB`)
      e.target.value = '' // Reset the file input
      setImageFile(null)
      setImagePreview(null)
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file)) // Instant local preview
  }

  const handleRemoveImage = () => {
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      !name.trim() ||
      !selectedState.trim() ||
      !selectedCity.trim() ||
      !address.trim()
    ) {
      return toast.error('Please fill in all required fields.')
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('state', selectedState.trim())
      formData.append('city', selectedCity.trim())
      formData.append('address', address.trim())
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const response = await axios.post(
        `${serverUrl}/api/shop/create-edit`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      )

      dispatch(setMyShopData(response.data))
      toast.success('Shop saved successfully!')
      navigate('/')
    } catch (error) {
      if (!error.response) {
        toast.error('Network error. Please check your connection.')
      } else {
        toast.error(error.response.data?.message || 'Failed to save shop. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const isEditMode = Boolean(myShopData)

  return (
    <div className='relative flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-orange-50 to-white'>
      {/* Back button */}
      <div
        onClick={() => navigate('/')}
        className='absolute flex items-center gap-1 text-orange-500 transition-colors cursor-pointer top-5 left-5 hover:text-orange-600'
      >
        <IoMdArrowBack size={35} />
      </div>

      <div className='w-full max-w-lg p-8 bg-white shadow-xl rounded-xl'>
        {/* Header */}
        <div className='flex flex-col items-center gap-3 mb-6'>
          <div className='p-4 bg-orange-100 rounded-full'>
            <FaUtensils size={35} className='text-orange-500' />
          </div>
          <h2 className='text-2xl font-extrabold'>
            {isEditMode ? 'Edit Shop' : 'Add Shop'}
          </h2>
        </div>

        <form className='space-y-5' onSubmit={handleSubmit}>
          {/* Shop Name */}
          <div>
            <label className='block mb-1 text-sm font-medium text-gray-700'>
              Shop Name <span className='text-red-500'>*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type='text'
              placeholder='Enter Shop Name'
              className={inputClass}
            />
          </div>

          {/* Shop Image */}
          <div>
            <label className='block mb-1 text-sm font-medium text-gray-700'>
              Shop Image{' '}
              <span className='text-xs font-normal text-gray-400'>(max {MAX_IMAGE_SIZE_MB}MB)</span>
            </label>
            <input
              onChange={handleImageChange}
              type='file'
              accept='image/*'
              className={inputClass}
            />

            {/* Image Preview */}
            {imagePreview && (
              <div className='relative mt-3'>
                <img
                  src={imagePreview}
                  alt='Shop preview'
                  onError={(e) => {
                    e.target.src = '/placeholder-shop.png' // fallback if URL breaks
                  }}
                  className='object-cover w-full h-48 border border-gray-200 rounded-lg'
                />
                <button
                  type='button'
                  onClick={handleRemoveImage}
                  className='absolute px-2 py-1 text-xs font-bold text-white transition-colors bg-red-500 rounded-md top-2 right-2 hover:bg-red-600'
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* State & City */}
          <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
            <div>
              <label className='block mb-1 text-sm font-medium text-gray-700'>
                State <span className='text-red-500'>*</span>
              </label>
              <input
                value={selectedState}
                onChange={handleStateChange}
                type='text'
                placeholder='Enter State'
                className={inputClass}
              />
            </div>
            <div>
              <label className='block mb-1 text-sm font-medium text-gray-700'>
                City <span className='text-red-500'>*</span>
              </label>
              <input
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                type='text'
                placeholder='Enter City'
                className={inputClass}
              />
            </div>
          </div>

          {/* Shop Address */}
          <div>
            <label className='block mb-1 text-sm font-medium text-gray-700'>
              Shop Address <span className='text-red-500'>*</span>
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              type='text'
              placeholder='Enter Shop Address'
              className={inputClass}
            />
          </div>

          {/* Submit */}
          <button
            type='submit'
            disabled={loading}
            className='w-full px-4 py-2 font-bold text-white transition-colors duration-200 bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60'
          >
            {loading ? 'Saving...' : 'Save Shop'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateEditShop