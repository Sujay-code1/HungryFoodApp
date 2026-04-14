import React from 'react'
import Nav from '../components/Nav'
import { useSelector } from 'react-redux';
import { FaUtensils, FaPen } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import OwnerItemCard from './OwnerItemCard';

function OwnerDashboard() {

  const { myShopData } = useSelector((state) => state.shop);
  const navigate = useNavigate()
  const items = Array.isArray(myShopData?.items) ? myShopData.items : [];

  return (
    <div className='w-full min-h-screen flex flex-col items-center bg-[#ffff]'>
      <Nav />

      {/* No Shop Data */}
      {!myShopData && (
        <div className="flex items-center justify-center w-full p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col items-center w-full max-w-md p-6 text-center bg-white rounded-lg shadow-md sm:p-8 lg:p-10">
            <FaUtensils size={30} className="mb-4 text-orange-500"/>
            <h2 className="mb-4 text-xl font-bold">Add Your Restaurant</h2>
            <p className="text-sm text-gray-600 sm:text-base">
              Set up your shop and start selling!
            </p>
            <button 
              onClick={() => navigate('/create-edit-shop')}
              className="px-4 py-2 mt-5 font-bold text-white bg-orange-500 rounded hover:bg-orange-700"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Shop Data Exists */}
      {myShopData && (
        <div className="flex flex-col items-center w-full gap-6 px-4 sm:px-6">
          <h1 className="flex items-center gap-3 mt-8 text-2xl font-bold text-center text-gray-900 sm:text-3xl">
            Welcome to {myShopData.name}
          </h1>

          <div className="relative w-full max-w-3xl overflow-hidden transition-shadow duration-300 bg-white border shadow-lg rounded-xl hover:shadow-xl">
            
            <div 
              className='absolute p-2 text-white transition-colors bg-red-800 rounded-full cursor-pointer top-4 right-4 hover:bg-gray-900'
              onClick={() => navigate('/create-edit-shop')}
            >
              <FaPen size={20} />
            </div>

            <img 
              src={myShopData.image} 
              alt={myShopData.name} 
              className="object-cover w-full h-64 sm:h-68" 
            />

            <div className='p-4 sm:p-6'>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                {myShopData.name}
              </h1>
              <p className="text-gray-600">
                {myShopData.city}, {myShopData.state}
              </p>
              <p className="text-gray-600">
                {myShopData.address}
              </p>
            </div>
          </div>

          {/* No Items */}
          {items.length === 0 && (
            <div className="flex items-center justify-center w-full p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col items-center w-full max-w-md p-6 text-center bg-white rounded-lg shadow-md sm:p-8 lg:p-10">
                <FaUtensils size={30} className="mb-4 text-orange-500"/>
                <h2 className="mb-4 text-xl font-bold">Add Your Food Item</h2>
                <p className="text-sm text-gray-600 sm:text-base">
                  Add Your Menu Items and Start getting Orders!
                </p>
                <button 
                  onClick={() => navigate('/add-item')}
                  className="px-4 py-2 mt-5 font-bold text-white bg-orange-500 rounded hover:bg-orange-700"
                >
                  Add Food Item
                </button>
              </div>
            </div>
          )}

          {/* Items List */}
          {items.length > 0 && (
            <div className='grid w-full max-w-4xl grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-3'>
              {items.map((item, index) => (
                <OwnerItemCard data={item} key={item._id || index} />
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  )
}

export default OwnerDashboard;