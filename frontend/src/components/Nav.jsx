import React, { useState, useRef, useEffect } from 'react'
import { IoLocationSharp } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { CiShoppingCart } from "react-icons/ci";
import { IoClose } from "react-icons/io5";
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../App';
import { setUserData } from '../redux/userSlice';


function Nav() {
    const { userData, city } = useSelector(state => state.user)
    const [showDropdown, setShowDropdown] = useState(false)
    const [showMobileSearch, setShowMobileSearch] = useState(false)
    const dropdownRef = useRef(null)

    const dispatch = useDispatch();
    

    const handleLogout = async() => {
        try {
             axios.post(`${serverUrl}/api/v1/auth/signout`,
                {withCredentials:true})
                dispatch(setUserData(null))
        } catch (error) {
            console.log("Logout failed:", error)
        }
    }

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className='w-full fixed top-0 z-[9999] bg-orange-500 shadow-md'>

            {/* Main navbar row */}
            <div className='w-full h-[70px] flex items-center justify-between px-4 md:px-6 gap-5'>
                <h1 className='mb-2 text-xl font-bold text-white md:text-3xl'>Hungry.</h1>

                {/* Search bar - desktop only */}
                <div className='md:w-[60%] lg:w-[38%] h-[80%] bg-white rounded-lg items-center gap-[20px] md:flex hidden'>
                    <div className='flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400'>
                        <IoLocationSharp size={25} className='text-[#ff4d2d]' />
                        <div className='w-[80%] truncate text-gray-600'>{city}</div>
                    </div>
                    <div className='w-[80%] flex items-center gap-[10px]'>
                        <FiSearch size={25} />
                        <input
                            className='px-[10px] text-gray-700 outline-none border-none w-full'
                            type='text'
                            placeholder='Search Good food'
                        />
                    </div>
                </div>

                {/* Right actions */}
                <div className='flex items-center gap-1 md:gap-5'>

                    {/* Mobile search toggle button */}
                    <button
                        onClick={() => setShowMobileSearch(prev => !prev)}
                        className='flex items-center justify-center transition-colors rounded-full cursor-pointer md:hidden w-9 h-9 hover:bg-orange-600'
                    >
                        {showMobileSearch
                            ? <IoClose size={22} className='text-white' />
                            : <FiSearch size={20} className='text-white' />
                        }
                    </button>

                    {/* My Orders - desktop only */}
                    <button className='hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition-colors cursor-pointer'>
                        My Orders
                    </button>

                    {/* Cart */}
                    <button className='relative flex items-center justify-center transition-colors rounded-full cursor-pointer w-9 h-9 hover:bg-orange-600'>
                        <CiShoppingCart size={26} className='text-white' />
                        <span className='absolute -top-1 -right-1 w-5 h-5 bg-white text-orange-500 text-[11px] font-bold rounded-full flex items-center justify-center'>
                            0
                        </span>
                    </button>

                    {/* Avatar + Dropdown */}
                    <div className='relative' ref={dropdownRef}>
                        <div
                            onClick={() => setShowDropdown(prev => !prev)}
                            className='flex items-center px-3 py-1 text-sm font-bold text-orange-500 bg-white rounded-full cursor-pointer select-none md:px-4 md:py-2 hover:bg-orange-200'
                        >
                            {userData?.fullName?.slice(0, 1) ?? 'U'}
                        </div>

                        {showDropdown && (
                            <div className='absolute right-0 top-[110%] w-[180px] bg-white shadow-2xl rounded-xl p-5 flex flex-col gap-3 z-[9999]'>
                                <div className='text-[17px] font-semibold'>
                                    {userData?.fullName ?? 'User'}
                                </div>
                                <div className='text-[#ff4d2d] font-semibold cursor-pointer hover:opacity-70'>
                                    My Order
                                </div>
                                <div 
                                onClick={handleLogout}
                                className='text-[#ff4d2d] cursor-pointer hover:opacity-70'>
                                    Log Out
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Mobile search bar — slides in below navbar */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${showMobileSearch ? 'max-h-[70px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className='flex items-center gap-3 px-4 py-3 bg-orange-400'>
                    <div className='flex items-center flex-1 gap-3 bg-white rounded-lg px-3 h-[42px]'>
                        <IoLocationSharp size={20} className='text-[#ff4d2d] shrink-0' />
                        <span className='pr-3 text-sm text-gray-500 border-r border-gray-300 shrink-0'>Cuttack</span>
                        <FiSearch size={18} className='text-gray-400 shrink-0' />
                        <input
                            autoFocus
                            className='flex-1 text-sm text-gray-700 border-none outline-none'
                            type='text'
                            placeholder='Search good food...'
                        />
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Nav