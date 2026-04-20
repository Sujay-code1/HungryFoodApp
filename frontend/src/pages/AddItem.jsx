import React, { useEffect, useState } from 'react'
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUtensils } from "react-icons/fa";
import axios from 'axios';
import { serverUrl } from '../config';
import { toast } from 'react-toastify';

const inputClass =
  'border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full transition-colors duration-200'

const MAX_IMAGE_SIZE_MB = 5

const CATEGORIES = [
  "Snacks", "Main Course", "Desserts", "Beverages",
  "Pizza", "Burgers", "Sandwiches", "South Indian",
  "North Indian", "Chinese", "Fast Food", "Others"
]

function AddItem() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const existingItem = state?.item || null

    const isEditMode = Boolean(existingItem)

  const [name, setName]           = useState('')
  const [price, setPrice]         = useState('')
  const [category, setCategory]   = useState('')
  const [foodType, setFoodType]   = useState('Veg')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading]     = useState(false)



  useEffect(() => {
    if (existingItem) {
      setName(existingItem.name || '')
      setPrice(existingItem.price || '')
      setCategory(existingItem.category || '')
      setFoodType(existingItem.foodType || 'Veg')
      setImagePreview(
        existingItem.image
          ? existingItem.image.startsWith('http')
            ? existingItem.image
            : `${serverUrl}${existingItem.image}`
          : null
      )
    }
  }, [existingItem])

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) { setImageFile(null); setImagePreview(null); return }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_IMAGE_SIZE_MB}MB`)
      e.target.value = ''
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleRemoveImage = () => {
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim())               return toast.error('Item name is required.')
    if (!price || Number(price) <= 0) return toast.error('Enter a valid price.')
    if (!category)                  return toast.error('Please select a category.')

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('price', price)
      formData.append('category', category)
      formData.append('foodType', foodType)
      if (imageFile) formData.append('image', imageFile)

      const url = isEditMode
        ? `${serverUrl}/api/item/edit-item/${existingItem._id}`
        : `${serverUrl}/api/item/add-item`

      const method = isEditMode ? 'put' : 'post'

      await axios[method](url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      })

      toast.success(`Item ${isEditMode ? 'updated' : 'added'} successfully!`)
      navigate('/')

   
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save item.')
    } finally {
      setLoading(false)
    }
  }

  

  return (
    <div className='relative flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-orange-50 to-white'>
      <div
        onClick={() => navigate('/')}
        className='absolute flex items-center gap-1 text-orange-500 transition-colors cursor-pointer top-5 left-5 hover:text-orange-600'
      >
        <IoMdArrowBack size={35} />
      </div>

      <div className='w-full max-w-lg p-8 bg-white shadow-xl rounded-xl'>
        <div className='flex flex-col items-center gap-3 mb-6'>
          <div className='p-4 bg-orange-100 rounded-full'>
            <FaUtensils size={35} className='text-orange-500' />
          </div>
          <h2 className='text-2xl font-extrabold'>
            {isEditMode ? 'Edit Food Item' : 'Add Food Item'}
          </h2>
        </div>

        <form className='space-y-5' onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className='block mb-1 text-sm font-medium text-gray-700'>
              Item Name <span className='text-red-500'>*</span>
            </label>
            <input value={name} onChange={e => setName(e.target.value)}
              type='text' placeholder='e.g. Paneer Tikka' className={inputClass} />
          </div>

          {/* Price + Category side by side */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block mb-1 text-sm font-medium text-gray-700'>
                Price (₹) <span className='text-red-500'>*</span>
              </label>
              <input value={price} onChange={e => setPrice(e.target.value)}
                type='number' min='0' placeholder='149' className={inputClass} />
            </div>
            <div>
              <label className='block mb-1 text-sm font-medium text-gray-700'>
                Category <span className='text-red-500'>*</span>
              </label>
              <select value={category} onChange={e => setCategory(e.target.value)} className={inputClass}>
                <option value=''>Select...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Food Type Toggle */}
          <div>
            <label className='block mb-1 text-sm font-medium text-gray-700'>
              Food Type <span className='text-red-500'>*</span>
            </label>
            <div className='grid grid-cols-2 gap-3'>
              {['Veg', 'Non-Veg'].map(type => (
                <button key={type} type='button' onClick={() => setFoodType(type)}
                  className={`py-2 rounded-md border font-medium text-sm transition-colors ${
                    foodType === type
                      ? type === 'Veg'
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-red-50 border-red-500 text-red-700'
                      : 'border-gray-300 text-gray-500'
                  }`}>
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    type === 'Veg' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Image */}
          <div>
            <label className='block mb-1 text-sm font-medium text-gray-700'>
              Image <span className='text-xs font-normal text-gray-400'>(max {MAX_IMAGE_SIZE_MB}MB)</span>
            </label>
            <input onChange={handleImageChange} type='file' accept='image/*' className={inputClass} />
            {imagePreview && (
              <div className='relative mt-3'>
                <img src={imagePreview} alt='preview'
                  onError={e => { e.target.src = '/placeholder-item.png' }}
                  className='object-cover w-full h-48 border border-gray-200 rounded-lg' />
                <button type='button' onClick={handleRemoveImage}
                  className='absolute px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-md top-2 right-2 hover:bg-red-600'>
                  Remove
                </button>
              </div>
            )}
          </div>

          <button type='submit' disabled={loading}
            className='w-full px-4 py-2 font-bold text-white bg-orange-500 rounded-md hover:bg-orange-600 disabled:opacity-60'>
            {loading ? 'Saving...' : isEditMode ? 'Update Item' : 'Add Item'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddItem