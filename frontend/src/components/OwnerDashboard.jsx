import React from 'react'
import Nav from '../components/Nav'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import OwnerItemCard from './OwnerItemCard'

const UtensilsIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
  </svg>
)

const PenIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const MapPinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)

const StoreIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

export default function OwnerDashboard() {
  const { myShopData } = useSelector((state) => state.shop)
  const navigate = useNavigate()
  const items = Array.isArray(myShopData?.items) ? myShopData.items : []

  return (
    <div className="w-full min-h-screen flex flex-col bg-orange-50/40">
      <Nav />

      {/* ── No Shop ── */}
      {!myShopData && (
        <div className="flex items-center justify-center flex-1 px-4 py-20">
          <div className="flex flex-col items-center w-full max-w-sm p-10 text-center bg-white border border-orange-100 rounded-2xl shadow-sm">
            <div className="flex items-center justify-center w-16 h-16 mb-5 rounded-2xl bg-orange-50 text-orange-400">
              <StoreIcon />
            </div>
            <h2 className="mb-2 text-xl font-bold text-neutral-800">No Restaurant Yet</h2>
            <p className="text-sm text-neutral-500 mb-6">
              Set up your shop profile and start receiving orders.
            </p>
            <button
              onClick={() => navigate('/create-edit-shop')}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200"
            >
              <PlusIcon /> Get Started
            </button>
          </div>
        </div>
      )}

      {/* ── Shop Exists ── */}
      {myShopData && (
        <div className="flex flex-col items-center w-full gap-8 px-4 sm:px-6 py-8">

          {/* Welcome heading */}
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 mb-1">Your Restaurant</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">
              Welcome back, <span className="text-orange-500">{myShopData.name}</span>
            </h1>
          </div>

          {/* Shop Banner Card */}
          <div className="relative w-full max-w-3xl overflow-hidden bg-white border border-orange-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">

            {/* Edit button */}
            <button
              onClick={() => navigate('/create-edit-shop')}
              className="absolute z-10 top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900/70 hover:bg-neutral-900 backdrop-blur-sm rounded-lg transition-colors"
            >
              <PenIcon /> Edit Shop
            </button>

            {/* Banner image */}
            <div className="w-full h-56 sm:h-64 overflow-hidden">
              <img
                src={myShopData.image}
                alt={myShopData.name}
                className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Shop info */}
            <div className="px-5 py-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-800">{myShopData.name}</h2>
                <div className="flex items-center gap-1 mt-1 text-sm text-neutral-500">
                  <MapPinIcon />
                  <span>{myShopData.address}, {myShopData.city}, {myShopData.state}</span>
                </div>
              </div>
              <span className="flex-shrink-0 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-green-700 bg-green-50 border border-green-200 rounded-full">
                Active
              </span>
            </div>
          </div>

          {/* ── No Items ── */}
          {items.length === 0 && (
            <div className="flex flex-col items-center w-full max-w-sm p-10 text-center bg-white border border-orange-100 rounded-2xl shadow-sm">
              <div className="flex items-center justify-center w-16 h-16 mb-5 rounded-2xl bg-orange-50 text-orange-400">
                <UtensilsIcon />
              </div>
              <h2 className="mb-2 text-xl font-bold text-neutral-800">No Menu Items</h2>
              <p className="text-sm text-neutral-500 mb-6">
                Add your first dish and start getting orders!
              </p>
              <button
                onClick={() => navigate('/add-item')}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200"
              >
                <PlusIcon /> Add Food Item
              </button>
            </div>
          )}

          {/* ── Items Grid ── */}
          {items.length > 0 && (
            <div className="w-full max-w-4xl">
              {/* Section header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 mb-0.5">Menu</p>
                  <h2 className="text-lg font-bold text-neutral-800">{items.length} Item{items.length !== 1 ? 's' : ''}</h2>
                </div>
                <button
                  onClick={() => navigate('/add-item')}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-orange-600 bg-orange-100 border border-orange-200 rounded-xl hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-200"
                >
                  <PlusIcon /> Add Item
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {items.map((item, index) => (
                  <OwnerItemCard data={item} key={item._id || index} />
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}