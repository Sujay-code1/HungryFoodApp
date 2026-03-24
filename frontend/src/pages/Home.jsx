import React from 'react'
import { useSelector } from 'react-redux'
import UserDashboard from '../components/userDashboard'
import OwnerDashboard from '../components/OwnerDashboard'
import DeliveryBoy from '../components/DeliveryBoy'
import Nav from '../components/Nav'

function Home() {
 
    const{userData} = useSelector(state=>state.user)

  return (
    <div className='w-[100vw] min-h-[100vh] pt-[100px] flex flex-col items-center bg-[#ffff]'>
      {userData === "user" && <UserDashboard/>}
      {userData === "owner" && <OwnerDashboard/>}
      {userData === "user" && <DeliveryBoy/>}
    <Nav/>
    </div>
  )
}

export default Home
