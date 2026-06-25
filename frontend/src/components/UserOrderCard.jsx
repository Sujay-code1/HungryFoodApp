import React from 'react'
import { MdAccessTime, MdLocationOn } from 'react-icons/md'
import { BsCashCoin } from 'react-icons/bs'

const STATUS_STYLES = {
  pending:           'bg-slate-100 text-slate-600 border-slate-200',
  preparing:         'bg-amber-100 text-amber-700 border-amber-200',
  'Out for delivery':'bg-blue-100 text-blue-700 border-blue-200',
  delivered:         'bg-green-100 text-green-700 border-green-200',
  cancelled:         'bg-red-100 text-red-700 border-red-200',
}

const STATUS_ICONS = {
  pending:           '🕐',
  preparing:         '👨‍🍳',
  'Out for delivery':'🛵',
  delivered:         '✅',
  cancelled:         '❌',
}

const STEPS = [
  { key: 'pending', label: 'Placed', icon: '📝' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'Out for delivery', label: 'On Way', icon: '🛵' },
  { key: 'delivered', label: 'Delivered', icon: '🎁' }
]

function StatusStepper({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 rounded-2xl p-3 mt-2">
        <span className="text-lg">❌</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider">Order Cancelled</p>
          <p className="text-[11px] text-red-500/80 font-medium">This order was cancelled and won't be processed.</p>
        </div>
      </div>
    )
  }

  // Calculate current active step index
  const currentIndex = STEPS.findIndex(s => s.key === status)
  
  // Calculate progress percentage
  // pending (index 0) => 0%
  // preparing (index 1) => 33%
  // Out for delivery (index 2) => 66%
  // delivered (index 3) => 100%
  const progressPercent = currentIndex >= 0 ? (currentIndex / (STEPS.length - 1)) * 100 : 0

  return (
    <div className="py-4 px-2 bg-slate-50/50 rounded-2xl border border-slate-100/50 mt-3">
      <div className="relative flex items-center justify-between w-full">
        {/* Background Track Line */}
        <div className="absolute top-[18px] left-[10%] right-[10%] h-[3px] bg-slate-200 -z-10 rounded-full" />
        {/* Active Track Line */}
        <div 
          className="absolute top-[18px] left-[10%] h-[3px] bg-gradient-to-r from-orange-400 to-orange-500 -z-10 rounded-full transition-all duration-700 ease-out" 
          style={{ width: `${progressPercent * 0.8}%` }} // Adjusted to match left/right offsets
        />

        {/* Step Nodes */}
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex
          const isActive = idx === currentIndex
          const isPending = idx > currentIndex

          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              {/* Node bubble */}
              <div 
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-300
                  ${isCompleted ? 'bg-orange-500 text-white scale-105' : ''}
                  ${isActive ? 'bg-orange-600 text-white ring-4 ring-orange-100 scale-110' : ''}
                  ${isPending ? 'bg-white border-2 border-slate-200 text-slate-400' : ''}
                `}
              >
                {isCompleted ? '✓' : step.icon}
              </div>

              {/* Node label */}
              <span 
                className={`
                  text-[10px] font-bold mt-1.5 transition-colors duration-300
                  ${isActive ? 'text-orange-600 font-extrabold' : 'text-slate-500'}
                  ${isCompleted ? 'text-orange-500' : ''}
                  ${isPending ? 'text-slate-400' : ''}
                `}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function UserOrderCard({ data }) {
  const orderTime = new Date(data.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-300">

      {/* ── Card Header ── */}
      <div className="flex items-center justify-between px-5 py-4 bg-orange-50/50 border-b border-orange-100/50 flex-wrap gap-2">
        <div className="space-y-0.5">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Order ID</p>
          <p className="text-sm font-extrabold text-slate-800">#{data._id.slice(-8).toUpperCase()}</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
            <MdAccessTime size={15} className="text-slate-400" />
            <span>{orderTime}</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
            <BsCashCoin size={15} className="text-slate-400" />
            <span className="capitalize">{data.paymentMethod}</span>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Paid Amount</p>
            <p className="font-extrabold text-orange-500 text-sm">₹{data.totalAmount}</p>
          </div>
        </div>
      </div>

      {/* ── Shop Sub-Orders ── */}
      <div className="divide-y divide-slate-100">
        {data.shopOrder?.map((shopOrd, i) => (
          <div key={i} className="px-5 py-5 space-y-4">

            {/* Shop name + status badge */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                🏪 <span className="hover:text-orange-500 transition-colors">{shopOrd.shop?.name || 'Restaurant'}</span>
              </p>
              <span className={`text-xs px-3 py-1 rounded-full font-bold border ${STATUS_STYLES[shopOrd.status] || 'bg-slate-100 text-slate-600'}`}>
                {STATUS_ICONS[shopOrd.status] || '🕐'} {shopOrd.status}
              </span>
            </div>

            {/* Premium Stepper Tracker for status */}
            <StatusStepper status={shopOrd.status} />

            {/* Food items with pictures */}
            <div className="space-y-3 pt-2">
              {shopOrd.shopOrderItems?.map((orderItem, j) => {
                const item = orderItem.item
                return (
                  <div key={j} className="flex items-center gap-3">
                    {/* Food image */}
                    <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-50 border border-slate-100">
                      {item?.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                        />
                      ) : null}
                      <div
                        className="w-full h-full flex items-center justify-center text-2xl"
                        style={{ display: item?.image ? 'none' : 'flex' }}
                      >
                        🍽️
                      </div>
                    </div>

                    {/* Name + qty + price */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {item?.name || 'Item'}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">₹{orderItem.price} × {orderItem.quantity}</p>
                    </div>
                    <p className="text-sm font-extrabold text-slate-700 flex-shrink-0">
                      ₹{orderItem.price * orderItem.quantity}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Subtotal */}
            <div className="flex justify-end pt-1">
              <p className="text-xs text-slate-400 font-semibold">
                Subtotal: <span className="font-extrabold text-slate-600 text-sm">₹{shopOrd.subtotal}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Delivery Address ── */}
      {data.deliveryAddress?.text && (
        <div className="flex items-start gap-2 px-5 py-3.5 bg-slate-50/60 border-t border-slate-100">
          <MdLocationOn size={18} className="text-orange-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery Address</p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">{data.deliveryAddress.text}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserOrderCard
