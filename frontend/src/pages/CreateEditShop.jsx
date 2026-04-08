import React from 'react'
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaUtensils } from "react-icons/fa";

function CreateEditShop() {
    const navigate = useNavigate()
    const {myShopData} = useSelector(state=>state.shop)
  return (
    <div className='flex justify-center flex-col items-center p-6 bg-gradient-to-br from-orange-50 relative to-white min-h-screen '>
      <div 
      onClick={()=>navigate("/")}
       className='absolute top-5 left-5 text-orange-500 cursor-pointer flex items-center gap-1'>
      <IoMdArrowBack size={35}/>
      </div>
      <div className='max-w-lg w-full bg-white shadow-xl rounded-xl p-8'>
           <div className='flex flex-col items-center mb-6 gap-3'>
               <div className='bg-orange-100 p-4 rounded-full mb-4'>
                 <FaUtensils size={35} className="text-orange-500 mb-4"/>
               </div>
               <div>
                {myShopData ? <h2 className='text-2xl font-extrabold mb-5'>Edit  Shop</h2> : <h2 className='text-2xl font-bold mb-5'>Add Shop</h2>}
               </div>
           </div>
      </div>
    </div>
  )
}

export default CreateEditShop
