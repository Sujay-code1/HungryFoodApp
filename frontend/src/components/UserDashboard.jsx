import React from 'react'
import Nav from '../components/Nav'
import { categories } from '../category'
import CategoryCard from '../components/CategoryCard'
import FoodCard from '../components/FoodCard'
import { useSelector } from 'react-redux'

function UserDashboard() {
  const { shopInMyCity, city } = useSelector(state => state.user);

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

        <div>
          <h2 className='mb-4 text-2xl font-bold'>Recommended Shops</h2>
          {city && <p className='mb-2 text-gray-600'>Showing shops in: {city}</p>}
          <div className='w-full pb-2 overflow-x-auto hide-scrollbar scroll-smooth'>
            <div className='flex gap-6 min-w-max'>
              {shopInMyCity && shopInMyCity.length > 0 ? (
                shopInMyCity.map((shop) => (
                  <div key={shop._id} className='bg-white rounded-lg shadow-md p-4 min-w-[250px] max-w-[250px] flex-shrink-0'>
                    <img src={shop.image} alt={shop.name} className='object-cover w-full h-32 mb-4 rounded-md' />
                    <h3 className='mb-1 text-lg font-semibold'>{shop.name}</h3>
                    <p className='text-sm text-gray-600'>{shop.address}, {shop.city}</p>
                  </div>
                ))
              ) : (
                <p className='text-gray-500'>No shops available in your city</p>
              )}
            </div>
          </div>
        </div>

        <div className='mt-8'>
          <h2 className='mb-4 text-2xl font-bold'>Food Items</h2>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {shopInMyCity && shopInMyCity.length > 0 ? (
              shopInMyCity.flatMap((shop) =>
                shop.items && shop.items.length > 0 ? (
                  shop.items.map((item) => (
                    <FoodCard key={item._id} item={item} shopName={shop.name} />
                  ))
                ) : []
              )
            ) : (
              <p className='text-gray-500 col-span-full'>No items available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard;
