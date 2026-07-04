import React, { useState } from 'react'
import axios from 'axios'
import { serverUrl } from '../config'
import { useDispatch, useSelector } from 'react-redux'
import { setMyOrders } from '../redux/userSlice'

/* ─── Status config ─────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  pending:           { label: 'Pending',          emoji: '🕐', dot: '#94a3b8', pill: 'bg-slate-100 text-slate-600 border-slate-200',   ring: 'ring-slate-300'  },
  preparing:         { label: 'Preparing',         emoji: '👨‍🍳', dot: '#f59e0b', pill: 'bg-amber-100  text-amber-700  border-amber-200',   ring: 'ring-amber-300'  },
  'Out for delivery':{ label: 'Out for Delivery',  emoji: '🛵', dot: '#3b82f6', pill: 'bg-blue-100   text-blue-700   border-blue-200',    ring: 'ring-blue-300'   },
  delivered:         { label: 'Delivered',          emoji: '✅', dot: '#22c55e', pill: 'bg-green-100  text-green-700  border-green-200',   ring: 'ring-green-300'  },
  cancelled:         { label: 'Cancelled',          emoji: '❌', dot: '#ef4444', pill: 'bg-red-100    text-red-700    border-red-200',     ring: 'ring-red-300'    },
}

const ALL_STATUSES = ['pending', 'preparing', 'Out for delivery', 'delivered', 'cancelled']

/* ─── SVG Icons ─────────────────────────────────────────────────────────── */
const PersonIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const MailIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
const PhoneIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.49 5.49l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
const PinIcon      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
const CoinIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
const ChevronIcon  = ({ open }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}><polyline points="6 9 12 15 18 9"/></svg>

function OwnerOrderCard({ data, shopOrderIndex = 0 }) {
  const [availableBoys, setAvailableBoys] = useState([])
  const dispatch  = useDispatch()
  const { myOrders } = useSelector(s => s.user)

  /* The shopOrder sub-document this owner owns */
  const shopOrd   = data?.shopOrder?.[shopOrderIndex]
  const cfg       = STATUS_CONFIG[shopOrd?.status] || STATUS_CONFIG.pending

  const [expanded, setExpanded]     = useState(true)
  const [updating, setUpdating]     = useState(false)
  const [dropOpen, setDropOpen]     = useState(false)
  const hasAssignedDeliveryBoy = Boolean(shopOrd?.assignedDeliveryBoy)

  /* Time & Date display */
  const orderDate  = new Date(data.createdAt)
  const timeStr    = orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  const dateStr    = orderDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

  /* Next logical status flow */
  const currentIdx  = ALL_STATUSES.indexOf(shopOrd?.status)
  const nextStatus  = (shopOrd?.status === 'cancelled' || shopOrd?.status === 'delivered')
    ? null
    : ALL_STATUSES[currentIdx + 1] || null

  const handleStatusChange = async (newStatus) => {
    if (!shopOrd?._id || !data?._id) return
    setUpdating(true)
    setDropOpen(false)
    try {
      const result = await axios.patch(
        `${serverUrl}/api/order/${data._id}/shop-order/${shopOrd._id}/status`,
        { status: newStatus },
        { withCredentials: true }
      )
      // Update redux state directly for instant local feedback
      const updated = myOrders.map(ord => {
        if (ord._id !== data._id) return ord
        return {
          ...ord,
          shopOrder: ord.shopOrder.map(so =>
            so._id === shopOrd._id
              ? {
                  ...so,
                  status: newStatus,
                  assignedDeliveryBoy: result.data?.assignedDeliveryBoy || so.assignedDeliveryBoy,
                  assignment: result.data?.assignment || so.assignment,
                }
              : so
          ),
        }
      })
      dispatch(setMyOrders(updated))
      setAvailableBoys(result.data?.deliveryBoys || [])
      console.log(result.data)
    } catch (err) {
      console.error('Status update failed:', err)
    } finally {
      setUpdating(false)
    }
  }

  if (!shopOrd) return null

  return (
    <div
      className={`
        bg-white rounded-3xl border shadow-sm overflow-hidden
        transition-all duration-300 hover:shadow-md
        ${cfg.ring} ring-1 mb-4
      `}
    >
      {/* ── Top accent bar ── */}
      <div
        className="h-1.5 w-full"
        style={{ background: `linear-gradient(90deg, ${cfg.dot}, ${cfg.dot}88)` }}
      />

      {/* ── Card Body ── */}
      <div className="p-5 space-y-4">
        
        {/* Row 1: Order ID, Time and Status Pill */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
              #{data._id.slice(-6).toUpperCase()}
            </span>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${cfg.pill}`}>
              {cfg.emoji} {cfg.label}
            </span>
          </div>
          <div className="text-right flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">{dateStr}, {timeStr}</span>
            <button
              onClick={() => setExpanded(p => !p)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
              title={expanded ? 'Hide Details' : 'Show Details'}
            >
              <ChevronIcon open={expanded} />
            </button>
          </div>
        </div>

        {/* Row 2: Customer Details Card (High Visibility) */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/80 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Customer Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <span className="text-slate-400"><PersonIcon /></span>
              <span className="font-semibold truncate">{data.user?.fullName || 'Customer'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="text-slate-400"><MailIcon /></span>
              <span className="truncate hover:text-orange-500" title={data.user?.email}>{data.user?.email || 'N/A'}</span>
            </div>
            {data.user?.mobile && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="text-slate-400"><PhoneIcon /></span>
                <span className="font-mono">{data.user.mobile}</span>
              </div>
            )}
          </div>
        </div>

        {/* Row 3: Food Items List with Images (Always Visible) */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Items Ordered</p>
          <div className="divide-y divide-slate-100">
            {shopOrd.shopOrderItems?.map((oi, index) => {
              const item = oi.item
              return (
                <div key={index} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    {/* Food Image */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-50 border border-slate-100 relative">
                      {item?.image ? (
                        <img 
                          src={item.image} 
                          alt={item?.name || 'Food item'} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-full h-full items-center justify-center text-xl bg-orange-50/50"
                        style={{ display: item?.image ? 'none' : 'flex' }}
                      >
                        🍽️
                      </div>
                    </div>

                    {/* Food Name & Details */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{item?.name || 'Item'}</h4>
                      <p className="text-xs text-slate-400 font-medium">₹{oi.price} × {oi.quantity}</p>
                    </div>
                  </div>

                  {/* Food Total Price */}
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-700">₹{(oi.price * oi.quantity).toFixed(0)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Expanded Info: Delivery address, payment info, etc. */}
        {expanded && (
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex flex-wrap gap-4 text-xs justify-between">
              {/* Payment Info */}
              <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100/60 px-2.5 py-1 rounded-lg">
                <CoinIcon />
                <span className="font-semibold uppercase">{data.paymentMethod}</span>
              </div>
              {/* Grand subtotal */}
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-medium">Subtotal:</span>
                <span className="text-base font-extrabold text-slate-800">₹{shopOrd.subtotal}</span>
              </div>
            </div>

            {/* Address */}
            {data.deliveryAddress?.text && (
              <div className="flex items-start gap-2 bg-amber-50/30 border border-amber-100/40 rounded-xl p-3">
                <span className="text-amber-500 mt-0.5"><PinIcon /></span>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-amber-600/80 uppercase tracking-wide">Delivery Address</p>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{data.deliveryAddress.text}</p>
                </div>
              </div>
            )}

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/80 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Delivery Boy Details</p>
                <span className="text-[10px] font-semibold text-slate-500 uppercase">{hasAssignedDeliveryBoy ? 'Assigned' : availableBoys.length ? 'Available' : 'Pending'}</span>
              </div>

              {hasAssignedDeliveryBoy && typeof shopOrd.assignedDeliveryBoy === 'object' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-slate-400"><PersonIcon /></span>
                    <div>
                      <p className="font-semibold text-slate-800">{shopOrd.assignedDeliveryBoy.fullName || 'Delivery Boy'}</p>
                      <p className="text-xs text-slate-500">Assigned delivery person</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-slate-400"><MailIcon /></span>
                    <span className="truncate">{shopOrd.assignedDeliveryBoy.email || 'No email'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-slate-400"><PhoneIcon /></span>
                    <span className="font-mono">{shopOrd.assignedDeliveryBoy.mobile || 'No number'}</span>
                  </div>
                </div>
              ) : hasAssignedDeliveryBoy ? (
                <p className="text-xs text-slate-600">Delivery boy assigned successfully.</p>
              ) : availableBoys.length > 0 ? (
                <div className="space-y-2">
                  {availableBoys.map((boy, index) => (
                    <div key={boy.id || index} className="p-3 rounded-2xl border border-slate-200 bg-white">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-800">{boy.name || 'Delivery Boy'}</p>
                        <span className="text-[10px] uppercase text-slate-500">Candidate</span>
                      </div>
                      <div className="mt-2 grid gap-1 text-xs text-slate-600">
                        {boy.mobile && (
                          <div className="flex items-center gap-2"><PhoneIcon /><span>{boy.mobile}</span></div>
                        )}
                        {boy.email && (
                          <div className="flex items-center gap-2"><MailIcon /><span>{boy.email}</span></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No delivery boy assigned yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Row 4: Status Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          {/* Quick logical action button */}
          {nextStatus ? (
            <button
              onClick={() => handleStatusChange(nextStatus)}
              disabled={updating}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold
                bg-orange-500 text-white hover:bg-orange-600 active:scale-95
                disabled:opacity-50 disabled:pointer-events-none
                transition-all duration-200 shadow-md shadow-orange-200
              `}
            >
              {updating ? (
                <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                STATUS_CONFIG[nextStatus]?.emoji
              )}
              Mark as {STATUS_CONFIG[nextStatus]?.label}
            </button>
          ) : (
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              🎉 Order Completed
            </span>
          )}

          {/* More options status picker */}
          <div className="relative">
            <button
              onClick={() => setDropOpen(p => !p)}
              disabled={updating}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Update Status <ChevronIcon open={dropOpen} />
            </button>

            {dropOpen && (
              <>
                {/* Backdrop overlay */}
                <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />
                
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="px-3 py-1.5 border-b border-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Set Status To</p>
                  </div>
                  {ALL_STATUSES.map(s => {
                    const sc = STATUS_CONFIG[s]
                    const isActive = shopOrd.status === s
                    return (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        className={`
                          w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-left transition-colors
                          ${isActive ? 'bg-orange-50 text-orange-600 font-bold' : 'text-slate-700 hover:bg-slate-50'}
                        `}
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: sc.dot }}
                        />
                        <span>{sc.emoji}</span>
                        <span>{sc.label}</span>
                        {isActive && <span className="ml-auto text-orange-500 font-bold">✓</span>}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default OwnerOrderCard
