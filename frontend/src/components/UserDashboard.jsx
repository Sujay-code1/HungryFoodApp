import React from 'react'
import Nav from '../components/Nav'
import { categories } from '../category'
import CategoryCard from '../components/CategoryCard'

function UserDashboard() {
  return (
    <div className='w-full min-h-screen flex flex-col items-center bg-[#ffff]'>
      <Nav />
      <div className='flex flex-col items-start w-full max-w-6xl gap-5 p-[10px] mt-[25px] md:mt-0'>
      
        <div className='w-full'>
          <div className='flex w-full gap-4 pb-2 overflow-x-auto hide-scrollbar scroll-smooth'>
            {categories.map((cate, index) => (
              <CategoryCard key={index} data={cate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard;
