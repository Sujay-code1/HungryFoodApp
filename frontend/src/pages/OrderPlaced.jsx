import React from 'react'
import { FaRegCheckCircle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

function OrderPlaced() {
    const navigate = useNavigate();
  return (
    <div className='min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4 relative overflow-hidden'>
      <FaRegCheckCircle className='text-green-500 text-6xl mb-4'/>
      <h1 className='text-2xl font-bold text-gray-800 sm:text-3xl'>Order Placed</h1>
      <p className='text-gray-600'>Thank you for your order. Your Order is being Prepared. You can Track Your Order Status in the  "My Orders" section.</p>
      <button 
       onClick={() => navigate('/my-orders')}
       className='bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors'>My Orders</button>
    </div>
  )
}

export default OrderPlaced
