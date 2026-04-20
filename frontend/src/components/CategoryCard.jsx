import React from 'react'

function CategoryCard({ data }) {
  return (
    <div className='w-[120px] md:w-[180px] rounded-2xl border-2 border-[#ff4d2d] shrink-0 overflow-hidden bg-gray-100 shadow-l relative '>
      <img src={data.image} alt={data.category} className='object-cover w-full h-full' />
      
       <div className='absolute bottom-0 left-0 px-3 py-1 text-sm font-medium text-center text-gray-800 shadow wi-full rounded-t-xl backdrop-blur'>
        {data.category}
       </div>
    </div>
  )
}

export default CategoryCard
