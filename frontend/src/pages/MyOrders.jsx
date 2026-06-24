import React from 'react'
import { useSelector } from 'react-redux';
import { IoArrowBackOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import UserOrderCard from '../components/UserOrderCard';
import OwnerOrderCard from '../components/OwnerOrderCard';
import useGetMyOrders from '../hooks/useGetMyOrders';

function MyOrders() {
  const navigate = useNavigate();
  const { userData, myOrders } = useSelector(state => state.user);

  useGetMyOrders();

  // Filter: only today's orders
  const todayOrders = myOrders?.filter(order => {
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    return (
      orderDate.getFullYear() === now.getFullYear() &&
      orderDate.getMonth()    === now.getMonth() &&
      orderDate.getDate()     === now.getDate()
    );
  }) ?? [];

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-white shadow-sm px-4 py-4 flex items-center gap-4'>
        <button
          onClick={() => navigate('/')}
          className='p-2 rounded-full hover:bg-gray-100 transition'
          title='Back'
        >
          <IoArrowBackOutline size={24} />
        </button>
        <div>
          <h1 className='text-xl font-bold text-gray-800'>Today's Orders</h1>
          <p className='text-xs text-gray-400'>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <span className='ml-auto bg-orange-100 text-orange-600 text-sm font-semibold px-3 py-1 rounded-full'>
          {todayOrders.length} order{todayOrders.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Body */}
      <div className='max-w-2xl mx-auto px-4 py-6 space-y-5'>
        {todayOrders.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-24 text-center'>
            <span className='text-6xl mb-4'>🍽️</span>
            <p className='text-lg font-semibold text-gray-600'>No orders today</p>
            <p className='text-sm text-gray-400 mt-1'>Your today's orders will appear here</p>
            <button
              onClick={() => navigate('/')}
              className='mt-6 bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-orange-600 transition'
            >
              Order Now
            </button>
          </div>
        ) : (
          todayOrders.map((order, index) =>
            userData?.role === 'user' ? (
              <UserOrderCard data={order} key={index} />
            ) : userData?.role === 'owner' ? (
              <OwnerOrderCard data={order} key={index} />
            ) : null
          )
        )}
      </div>
    </div>
  );
}

export default MyOrders;
