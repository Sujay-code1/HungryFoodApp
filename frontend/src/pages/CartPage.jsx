import React from 'react'
import { IoArrowBackOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CartItemCard from '../components/CartItemCard';

function CartPage() {
    const navigate = useNavigate();
    const {cartItems}=useSelector((state) => state.user);
  return (
    <div className='flex justify-center min-h-screen p-6 bg-gray-100'>
      <div className='relative w-full max-w-5xl'>
        <div
          onClick={() => navigate('/')}
          className='absolute z-20 p-1 rounded-full cursor-pointer top-6 left-6 hover:bg-gray-200'
          title='Back'
        >
          <IoArrowBackOutline size={30} />
        </div>

        <h1 className='mt-6 text-2xl font-bold text-center'>Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className='flex flex-col items-center justify-center mt-20'>
            <p className='text-center text-gray-500'>Your cart is empty.</p>
          </div>
        ) : (
          <div className='mt-6 md:grid md:grid-cols-3 md:gap-6'>
            {/* Left: Items list (span 2) */}
            <div className='md:col-span-2'>
              <div className='space-y-3'>
                {cartItems.map((item, index) => (
                  <CartItemCard key={index} data={item} />
                ))}
              </div>
            </div>

            {/* Right: Order summary */}
            <aside className='mt-6 md:mt-0 md:col-span-1'>
              <div className='sticky p-4 bg-white rounded-lg shadow-md top-24'>
                <h2 className='mb-4 text-xl font-bold'>Order Summary</h2>
                <p className='font-bold text-gray-600'>Total Items: {cartItems.reduce((acc, item) => acc + item.quantity, 0)}</p>
                <p className='text-gray-600 font-sm'>Total Price: ₹{cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}</p>
                <button
                  className='w-full px-4 py-2 mt-4 text-white bg-orange-600 rounded hover:bg-orange-700 active:scale-95'
                  onClick={() => navigate('/checkout')} 
                >
                  Checkout
                </button>
              </div>
            </aside>
          </div>
        )}

      </div>
    </div>
  )
}

export default CartPage
