import React from 'react'
import { IoArrowBackOutline } from "react-icons/io5";
import { CiLocationOn } from "react-icons/ci";
import { GoSearch } from "react-icons/go";
import { MdOutlineMyLocation } from "react-icons/md";
import { useNavigate } from 'react-router-dom';

function CheckOut() {
  const navigate = useNavigate()
  return (
    <div className='flex items-center justify-center min-h-screen px-4 py-6 bg-gray-100'>
      <div className='z-[10] absolute top-4 left-4 sm:top-5 sm:left-5' onClick={() => navigate("/")}>
        <IoArrowBackOutline size={28} className='text-gray-700 cursor-pointer' />
      </div>

      <div className='w-full max-w-[900px] bg-white rounded-3xl shadow-xl p-6 md:p-8 space-y-6'>
        <h1 className='text-2xl font-bold text-gray-800 sm:text-3xl'>Checkout</h1>

        <section>
          <h2 className='flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800 sm:text-xl'>
            <CiLocationOn size={28} className='text-red-500' />
            Delivery Location
          </h2>

          <div className='flex flex-col gap-3 mb-2 sm:flex-row sm:items-center'>
            <input
              type='text'
              placeholder='Enter your delivery address'
              className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
            />

            <div className='flex gap-2 sm:gap-3 sm:shrink-0'>
              <button className='w-full px-4 py-3 text-white transition-colors bg-red-500 rounded-lg sm:w-auto hover:bg-red-600'>
                <GoSearch size={18} />
              </button>
              <button className='w-full px-4 py-3 text-white transition-colors bg-blue-500 rounded-lg sm:w-auto hover:bg-blue-600'>
                <MdOutlineMyLocation size={18} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default CheckOut;
