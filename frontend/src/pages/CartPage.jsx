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
      <div className='w-full max-w-[800px]'>
       <div>
       <div 
           onClick={()=>navigate("/")}
           className='absolute top-[20px] left-[20px] z-[10] mb-[10px] '>
               <IoArrowBackOutline size={35} className='cursor-pointer'/>
           </div>
           <h1 className='mt-10 text-2xl font-bold text-center'>Your Cart</h1>
           </div>
             {cartItems.length === 0 ? (
                <p className='mt-20 text-center text-gray-500'>Your cart is empty.</p>
             ):(
                <div>
                   {cartItems.map((item, index)=>{
                      return <CartItemCard key={index} data={item} />;
                   })}
                </div>
             )}
       </div>

     
    </div>
  )
}

export default CartPage
