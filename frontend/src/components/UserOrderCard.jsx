import React from 'react'
import { MdAccessTime, MdLocationOn } from 'react-icons/md'
import { BsCashCoin } from 'react-icons/bs'

const STATUS_STYLES = {
  pending:           'bg-gray-100 text-gray-600',
  preparing:         'bg-yellow-100 text-yellow-700',
  'Out for delivery':'bg-blue-100 text-blue-700',
  delivered:         'bg-green-100 text-green-700',
  cancelled:         'bg-red-100 text-red-700',
}

const STATUS_ICONS = {
  pending:           '🕐',
  preparing:         '👨‍🍳',
  'Out for delivery':'🛵',
  delivered:         '✅',
  cancelled:         '❌',
}

function UserOrderCard({ data }) {
  const orderTime = new Date(data.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* ── Card Header ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-orange-50 border-b border-orange-100">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Order ID</p>
          <p className="text-sm font-bold text-gray-800">#{data._id.slice(-8).toUpperCase()}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MdAccessTime size={14} />
          <span>{orderTime}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <BsCashCoin size={14} />
          <span className="capitalize">{data.paymentMethod}</span>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Total</p>
          <p className="font-bold text-orange-500 text-sm">₹{data.totalAmount}</p>
        </div>
      </div>

      {/* ── Shop Sub-Orders ── */}
      <div className="divide-y divide-gray-50">
        {data.shopOrder?.map((shopOrd, i) => (
          <div key={i} className="px-4 py-4 space-y-3">

            {/* Shop name + status badge */}
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-800 text-sm">
                🏪 {shopOrd.shop?.name || 'Shop'}
              </p>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${STATUS_STYLES[shopOrd.status] || 'bg-gray-100 text-gray-600'}`}>
                {STATUS_ICONS[shopOrd.status] || '🕐'} {shopOrd.status}
              </span>
            </div>

            {/* Food items with pictures */}
            <div className="space-y-2">
              {shopOrd.shopOrderItems?.map((orderItem, j) => {
                const item = orderItem.item
                return (
                  <div key={j} className="flex items-center gap-3">
                    {/* Food image */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
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
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {item?.name || 'Item'}
                      </p>
                      <p className="text-xs text-gray-400">Qty: {orderItem.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 flex-shrink-0">
                      ₹{orderItem.price * orderItem.quantity}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Subtotal */}
            <div className="flex justify-end pt-1">
              <p className="text-xs text-gray-400">
                Subtotal: <span className="font-semibold text-gray-600">₹{shopOrd.subtotal}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Delivery Address ── */}
      {data.deliveryAddress?.text && (
        <div className="flex items-start gap-2 px-4 py-3 bg-gray-50 border-t border-gray-100">
          <MdLocationOn size={16} className="text-orange-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-500 leading-relaxed">{data.deliveryAddress.text}</p>
        </div>
      )}
    </div>
  )
}

export default UserOrderCard;
