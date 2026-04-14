import React from 'react'
import { FaPen, FaTrash } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { serverUrl } from '../config';

function OwnerItemCard({ data }) {
  const navigate = useNavigate()

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this item?')
    if (!confirmed) return

    try {
      await axios.delete(`${serverUrl}/api/item/delete-item/${data._id}`, {
        withCredentials: true,
      })
      toast.success('Item deleted successfully')
      window.location.reload()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete item.')
    }
  }

  return (
    <div className="flex max-w-2xl overflow-hidden transition-shadow bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg">
      <div className="flex-shrink-0 w-1/3">
        <img
          src={data.image}
          alt={data.name}
          onError={e => { e.target.src = '/placeholder-item.png' }}  // ← fallback
          className="object-cover w-full h-full min-h-[120px]"
        />
      </div>
      <div className="flex flex-col justify-between w-2/3 p-4">
        <div>
          {/* Veg/Non-Veg indicator */}
          <span className={`inline-block w-2 h-2 rounded-full mr-1 ${data.foodType === 'Veg' ? 'bg-green-500' : 'bg-red-500'}`} />
          <h3 className="inline text-lg font-bold text-gray-900">{data.name}</h3>
          <p className="mt-1 text-sm text-gray-500">{data.category}</p>
          <p className="mt-2 text-xl font-bold text-orange-500">₹{Number(data.price).toFixed(2)}</p> {/* ← ₹ not $ */}
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => navigate(`/edit-item/${data._id}`, { state: { item: data } })}
            className="flex items-center gap-1 px-3 py-1 text-sm text-white bg-orange-500 rounded hover:bg-orange-600"
          >
            <FaPen size={12} /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
          >
            <FaTrash size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default OwnerItemCard