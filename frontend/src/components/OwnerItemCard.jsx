import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { serverUrl } from '../config'

const PenIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)

const LeafIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-11 5z"/>
  </svg>
)

const FlameIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
)

const Spinner = () => (
  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
  </svg>
)

export default function OwnerItemCard({ data }) {
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const isVeg = data.foodType === 'Veg'

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await axios.delete(`${serverUrl}/api/item/delete-item/${data._id}`, { withCredentials: true })
      toast.success('Item removed from menu')
      window.location.reload()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete item.')
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  return (
    <div className="relative flex w-full max-w-md overflow-hidden transition-all duration-300 bg-orange-50 border border-orange-100 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5">

      {/* ── Confirm Delete Overlay ── */}
      {confirmOpen && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-6 bg-neutral-900/80 backdrop-blur-sm rounded-2xl">
          <div className="text-center">
            <p className="text-orange-200 font-semibold text-base leading-snug">Remove "{data.name}"?</p>
            <p className="text-neutral-400 text-sm mt-1">This item will be permanently deleted.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
              className="px-4 py-2 text-sm font-semibold text-orange-200 border border-orange-200/30 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {deleting ? <Spinner /> : <TrashIcon />}
              {deleting ? 'Removing…' : 'Yes, Remove'}
            </button>
          </div>
        </div>
      )}

      {/* ── Image ── */}
      <div className="relative flex-shrink-0 w-2/5 overflow-hidden bg-orange-100">
        <img
          src={data.image}
          alt={data.name}
          onError={e => { e.target.src = '/placeholder-item.png' }}
          className="object-cover w-full h-full min-h-[150px] transition-transform duration-500 group-hover:scale-105"
        />
        <span className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm border
          ${isVeg
            ? 'bg-green-50/90 text-green-700 border-green-200/60'
            : 'bg-red-50/90 text-red-600 border-red-200/60'
          }`}>
          {isVeg ? <LeafIcon /> : <FlameIcon />}
          {isVeg ? 'Veg' : 'Non-veg'}
        </span>
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col justify-between flex-1 p-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-1">
            {data.category}
          </p>
          <h3 className="text-lg font-bold text-neutral-800 leading-tight tracking-tight">
            {data.name}
          </h3>
          <p className="mt-2 text-xl font-extrabold text-orange-500 tracking-tight">
            <span className="text-sm font-semibold text-orange-300 mr-0.5">₹</span>
            {Number(data.price).toFixed(2)}
          </p>
        </div>

        <div className="my-3 h-px bg-gradient-to-r from-orange-200 to-transparent" />

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/edit-item/${data._id}`, { state: { item: data } })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-600 bg-orange-100 border border-orange-200 rounded-lg hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:shadow-md hover:shadow-orange-200 transition-all duration-200"
          >
            <PenIcon /> Edit
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 border border-red-200 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-md hover:shadow-red-100 transition-all duration-200 disabled:opacity-50"
          >
            <TrashIcon /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}