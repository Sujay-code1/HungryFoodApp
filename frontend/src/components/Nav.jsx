import React from 'react'
import { IoLocationSharp } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { CiShoppingCart } from "react-icons/ci";
import { useSelector } from 'react-redux'

function Nav() {
    const{userData} = useSelector(state=>state.user) 
    return (
        <div className='w-full h-[70px] flex items-center justify-between px-4  md:px-6 fixed top-0 z-[9999] bg-orange-500 shadow-md  gap-5'>
            <h1 className='mb-2 text-xl font-bold text-[#fff]  md:text-3xl'>Hungry.</h1>
            {/* location search field div */}
            <div className='md:w-[60%] lg:w-[38%] h-[80%] bg-white  rounded-lg items-center gap-[20px] md:flex hidden '>
                <div className='flex items-center w-[30%] overFlow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400 '> 
                <IoLocationSharp size={25} className='text-[#ff4d2d]' />
                    <div className='w-[80%] truncate text-gray-600 '>Cuttack</div> 
                    </div> 
                    <div className='w-[80%] flex items-center gap-[10px] relative'> 
                    <FiSearch  size={25} />
                    <input className='px-[10px] text-gray-700 outline-none border-none w-full ' type='text' placeholder='Search Good food' /> 
                    </div> 
                    </div>
                    {/* right acton */}

                   <div className='flex items-center gap-1 md:gap-5'>
                    <button className='flex items-center justify-center transition-colors rounded-full cursor-pointer md:hidden w-9 h-9 hover:bg-orange-600'>
                    <FiSearch size={20} className='text-white' />
                </button>
            <button className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition-colors cursor-pointer'>
                    My Orders
                </button>
 
                {/* Cart */}
                <button className='relative flex items-center justify-center transition-colors rounded-full cursor-pointer w-9 h-9 hover:bg-orange-600'>
                    <CiShoppingCart size={26} className='text-white' />
                    <span className='absolute -top-1 -right-1 w-5 h-5 bg-white text-orange-500 text-[11px] font-bold rounded-full flex items-center justify-center'>
                        0
                    </span>
                </button>
 
                {/* User Avatar */}
                <div className='items-center hidden px-4 py-2 text-sm font-bold text-orange-500 transition-colors bg-white rounded-full cursor-pointer select-none md:flex justify-c:enter hover:bg-orange-500'>
                    {userData?.fullName?.slice(0, 1) ?? 'U'}
                </div>
 
            </div>
        </div>
        )
}

export default Nav