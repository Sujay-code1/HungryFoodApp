import React, { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { IoArrowBackOutline } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import UserOrderCard from '../components/UserOrderCard'
import OwnerOrderCard from '../components/OwnerOrderCard'
import useGetMyOrders from '../hooks/useGetMyOrders'

/* ─── Filter config ──────────────────────────────────────────────────────── */
const USER_FILTERS  = ['all', 'pending', 'preparing', 'Out for delivery', 'delivered', 'cancelled']
const OWNER_FILTERS = ['all', 'pending', 'preparing', 'Out for delivery', 'delivered', 'cancelled']

const FILTER_META = {
  all:               { label: 'All',            emoji: '📋', color: 'text-gray-600',   bg: 'bg-gray-100',    activeBg: 'bg-gray-800 text-white'   },
  pending:           { label: 'Pending',         emoji: '🕐', color: 'text-slate-600',  bg: 'bg-slate-100',   activeBg: 'bg-slate-700 text-white'   },
  preparing:         { label: 'Preparing',        emoji: '👨‍🍳', color: 'text-amber-700',  bg: 'bg-amber-50',    activeBg: 'bg-amber-500 text-white'   },
  'Out for delivery':{ label: 'Out for Delivery', emoji: '🛵', color: 'text-blue-700',   bg: 'bg-blue-50',     activeBg: 'bg-blue-600 text-white'    },
  delivered:         { label: 'Completed',         emoji: '✅', color: 'text-green-700',  bg: 'bg-green-50',    activeBg: 'bg-green-600 text-white'   },
  cancelled:         { label: 'Cancelled',         emoji: '❌', color: 'text-red-700',    bg: 'bg-red-50',      activeBg: 'bg-red-600 text-white'     },
}

const STATUS_DOT = {
  pending:            '#94a3b8',
  preparing:          '#f59e0b',
  'Out for delivery': '#3b82f6',
  delivered:          '#22c55e',
  cancelled:          '#ef4444',
}

/* ─── Helper: get the "relevant" shopOrder status for a given owner ─────── */
const getOwnerShopOrdStatus = (order, ownerId) => {
  if (!ownerId) return 'pending'
  const so = order.shopOrder?.find(s => {
    const ownerField = s.owner
    if (!ownerField) return false
    const id = (typeof ownerField === 'object' && ownerField !== null)
      ? (ownerField._id || ownerField)
      : ownerField
    return id?.toString() === ownerId?.toString()
  })
  return so?.status || 'pending'
}

/* ─── Mini stat card ─────────────────────────────────────────────────────── */
function StatCard({ emoji, label, count, dot }) {
  return (
    <div className="flex-shrink-0 flex flex-col items-center justify-center gap-0.5 px-4 py-2.5 bg-white rounded-2xl shadow-sm border border-gray-100 min-w-[72px]">
      <span className="text-lg leading-none">{emoji}</span>
      <span className="text-base font-extrabold text-gray-800 leading-none">{count}</span>
      <span className="text-[10px] text-gray-400 font-medium leading-none capitalize">{label}</span>
    </div>
  )
}

/* ─── Filter Chip ─────────────────────────────────────────────────────────── */
function FilterChip({ filterKey, count, active, onClick }) {
  const meta = FILTER_META[filterKey]
  return (
    <button
      onClick={() => onClick(filterKey)}
      className={`
        flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold
        transition-all duration-200 border
        ${active
          ? meta.activeBg + ' border-transparent shadow-sm'
          : meta.color + ' ' + meta.bg + ' border-transparent hover:border-gray-200'
        }
      `}
    >
      <span>{meta.emoji}</span>
      <span>{meta.label}</span>
      <span className={`
        text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center
        ${active ? 'bg-white/25 text-white' : 'bg-white/80 text-gray-600'}
      `}>
        {count}
      </span>
    </button>
  )
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
function MyOrders() {
  const navigate = useNavigate()
  const { userData, myOrders } = useSelector(state => state.user)
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')

  useGetMyOrders()

  const isOwner = userData?.role === 'owner'

  /* Get all orders (retaining all orders instead of strictly filtering today's date) */
  const allOrdersList = useMemo(() => {
    return myOrders ?? []
  }, [myOrders])

  /* Count per status */
  const counts = useMemo(() => {
    const map = { all: allOrdersList.length, pending: 0, preparing: 0, 'Out for delivery': 0, delivered: 0, cancelled: 0 }
    allOrdersList.forEach(o => {
      const status = isOwner ? getOwnerShopOrdStatus(o, userData?._id) : o.shopOrder?.[0]?.status || 'pending'
      if (map[status] !== undefined) map[status]++
    })
    return map
  }, [allOrdersList, isOwner, userData])

  /* Search + filter */
  const filteredOrders = useMemo(() => {
    let list = allOrdersList

    if (activeFilter !== 'all') {
      list = list.filter(o => {
        const status = isOwner
          ? getOwnerShopOrdStatus(o, userData?._id)
          : o.shopOrder?.[0]?.status || 'pending'
        return status === activeFilter
      })
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(o => {
        const nameMatch    = o.user?.fullName?.toLowerCase().includes(q)
        const idMatch      = o._id?.toLowerCase().includes(q)
        const addressMatch = o.deliveryAddress?.text?.toLowerCase().includes(q)
        const itemMatch    = o.shopOrder?.some(so =>
          so.shopOrderItems?.some(si => si.item?.name?.toLowerCase().includes(q))
        )
        return nameMatch || idMatch || addressMatch || itemMatch
      })
    }

    return list
  }, [allOrdersList, activeFilter, search, isOwner, userData])

  /* For owner: find the shopOrderIndex for this owner's sub-order */
  const getShopOrderIndex = (order) => {
    if (!isOwner || !userData?._id) return 0
    const idx = order.shopOrder?.findIndex(s => {
      const ownerField = s.owner
      if (!ownerField) return false
      const id = (typeof ownerField === 'object' && ownerField !== null)
        ? (ownerField._id || ownerField)
        : ownerField
      return id?.toString() === userData?._id?.toString()
    })
    return idx >= 0 ? idx : 0
  }

  const filters = isOwner ? OWNER_FILTERS : USER_FILTERS

  const todayLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #f8fafc 60%, #fef3c7 100%)' }}>

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">

        {/* Top row */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2.5 rounded-2xl hover:bg-gray-100 transition-colors text-gray-600 flex-shrink-0"
          >
            <IoArrowBackOutline size={20} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-extrabold text-gray-900 leading-tight">
              {isOwner ? "Restaurant Orders" : "My Orders"}
            </h1>
            <p className="text-[11px] text-gray-400 truncate">{todayLabel}</p>
          </div>

          {/* Total count badge */}
          <div className="flex-shrink-0 text-center">
            <p className="text-2xl font-extrabold text-orange-500 leading-none">{allOrdersList.length}</p>
            <p className="text-[10px] text-gray-400 font-medium">total</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isOwner ? "Search by customer, item, ID…" : "Search orders…"}
              className="w-full pl-8 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent placeholder-gray-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter chips — horizontally scrollable */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
          {filters.map(f => (
            <FilterChip
              key={f}
              filterKey={f}
              count={counts[f] ?? 0}
              active={activeFilter === f}
              onClick={setActiveFilter}
            />
          ))}
        </div>
      </div>

      {/* ── Stats Row (owner only) ── */}
      {isOwner && allOrdersList.length > 0 && (
        <div className="flex gap-3 px-4 pt-4 pb-1 overflow-x-auto no-scrollbar">
          {Object.entries(counts).filter(([k]) => k !== 'all').map(([status, count]) => (
            <StatCard
              key={status}
              emoji={FILTER_META[status]?.emoji}
              label={status === 'Out for delivery' ? 'On Way' : status === 'delivered' ? 'Completed' : status}
              count={count}
              dot={STATUS_DOT[status]}
            />
          ))}
        </div>
      )}

      {/* ── Body ── */}
      <div className="px-4 pt-4 pb-10 space-y-3 max-w-2xl mx-auto">

        {/* No orders at all */}
        {allOrdersList.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-6xl mb-4">🍽️</span>
            <p className="text-lg font-bold text-gray-700">No orders yet</p>
            <p className="text-sm text-gray-400 mt-1">
              {isOwner ? "Orders will appear here as customers place them." : "Your orders will appear here."}
            </p>
            {!isOwner && (
              <button
                onClick={() => navigate('/')}
                className="mt-6 bg-orange-500 text-white px-6 py-2.5 rounded-2xl text-sm font-bold hover:bg-orange-600 transition shadow-sm"
              >
                Order Now
              </button>
            )}
          </div>
        )}

        {/* Filtered result is empty but there are orders */}
        {allOrdersList.length > 0 && filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-3">🔎</span>
            <p className="text-base font-bold text-gray-600">No orders match</p>
            <p className="text-sm text-gray-400 mt-1">Try a different filter or search term.</p>
            <button
              onClick={() => { setActiveFilter('all'); setSearch('') }}
              className="mt-4 text-sm font-bold text-orange-500 underline underline-offset-2"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Order list */}
        {filteredOrders.map((order, index) => {
          const soIdx = getShopOrderIndex(order)
          return isOwner ? (
            <OwnerOrderCard
              key={order._id || index}
              data={order}
              shopOrderIndex={soIdx}
            />
          ) : (
            <UserOrderCard key={order._id || index} data={order} />
          )
        })}

        {/* Load indicator when many */}
        {filteredOrders.length >= 50 && (
          <p className="text-center text-xs text-gray-400 py-4">
            Showing {filteredOrders.length} orders — use filters to narrow down
          </p>
        )}
      </div>
    </div>
  )
}

export default MyOrders
