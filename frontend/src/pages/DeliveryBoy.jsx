import React from 'react'
import Nav from '../components/Nav'
import { useSelector } from 'react-redux'
import axios from 'axios'
import {serverUrl} from '../config'
import { useEffect } from 'react';

function DeliveryBoy() {
    const {userData} = useSelector(state=>state.user)
    const getAssignments = async ()=>{
      try {
       const result =  await axios.get(`${serverUrl}/api/order/get-assignments`,{withCredentials:true})
      }catch(err){
        console.log(err)
      }
    }
    
    useEffect(()=>{
       getAssignments()
    },[userData])
  return (
    <div className='w-screen min-h-screen pt-[100px] flex flex-col items-center bg-[#ffff] overflow-y-auto'>
      <Nav/>
      <div className="w-full max-w-[800px] flex flex-col gap-5 items-center">
         <div className='bg-[#f5f5f5] rounded-2xl shadow-md p-5 flex justify-between items-center w-[90%] border border-gray-300 text-center'>
             <h1 className='text-xl text-orange-500'>Welcome, {userData?.fullName}</h1>
             <p className='text-sm text-gray-600'>Latitude: {userData.location.coordinates[1]}, Longitude: {userData.location.coordinates[0]}</p>
         </div>
      </div>
    </div>
  )
} 

export default DeliveryBoy
