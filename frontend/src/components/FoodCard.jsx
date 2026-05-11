import React from 'react';
import { FaStar } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/userSlice';

function FoodCard({ item, shopName }) {
  const dispatch = useDispatch();
  const ratingValue = item.rating?.average ?? item.rating ?? 0;

  const handleAddToCart = () => {
    const cartItem = {
      id: item._id,
      name: item.name,
      image: item.image,
      shop: shopName,
      price: item.price,
      quantity: 1,
      foodType: item.foodType
    };
    dispatch(addToCart(cartItem));
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i += 1) {
      stars.push(
        <FaStar
          key={i}
          className={`text-lg ${i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  return (
    <div className='w-full p-4 overflow-hidden bg-white rounded-lg shadow-md'>
      {item.image && (
        <img
          src={item.image}
          alt={item.name}
          className='object-cover w-full h-40 mb-3 rounded-md'
        />
      )}
      <div className='flex flex-col gap-3 mb-2 sm:flex-row sm:items-center sm:justify-between'>
        <h3 className='text-lg font-semibold break-words'>{item.name}</h3>
        <span
          className={`text-xs font-semibold uppercase px-2 py-1 rounded-full ${
            item.foodType === 'Veg'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {item.foodType || 'Unknown'}
        </span>
      </div>
      <p className='mb-2 text-sm text-gray-600 break-words'>{item.description}</p>
      <div className='flex items-center gap-2 mb-2'>
        <div className='flex items-center'>{renderStars(ratingValue)}</div>
        <span className='text-xs text-gray-500'>
          {ratingValue > 0 ? ratingValue.toFixed(1) : "No ratings yet"}
        </span>
      </div>
      <p className='font-bold text-[#ff4d2d] mb-2'>₹{item.price}</p>
      <p className='text-sm text-gray-500'>From: {shopName}</p>
      <div className='mt-3'>
        <button onClick={handleAddToCart} className='w-full py-2 font-semibold text-white bg-[#ff4d2d] rounded-md hover:bg-[#e64527] sm:w-auto px-4'>
          Add Food
        </button>
      </div>
    </div>
  );
}

export default FoodCard;
