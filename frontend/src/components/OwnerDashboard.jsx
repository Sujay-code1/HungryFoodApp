import React from 'react'
import Nav from '../components/Nav'
import { useSelector } from 'react-redux';
import { FaUtensils } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

function OwnerDashboard() {

  const { myShopData } = useSelector((state) => state.shop);
  const navigate = useNavigate()

  return (
    <div className='w-full min-h-screen flex flex-col items-center bg-[#ffff]'>
      <Nav />
      {!myShopData && 
           <div className="flex justify-center items-center p-4 sm:p-6 lg:p-8 w-full">
           
                <div className="bg-white shadow-md rounded-lg p-6 sm:p-8 lg:p-10 max-w-md w-full text-center flex flex-col items-center">
                <FaUtensils size={30} className="text-orange-500 mb-4"/>
                  <h2 className="text-xl font-bold mb-4">Add Your Restaurant</h2>
                  <p className="text-gray-600 text-sm sm:text-base">Set up your shop and start selling!</p>
                  <button 
                   onClick={()=>navigate('/create-edit-shop')}
                  className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mt-5">
                    Get Started
                  </button>
                </div>

           </div>

      }
    </div>
  )
}

export default OwnerDashboard;
