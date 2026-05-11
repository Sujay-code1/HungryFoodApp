import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { MdDeleteOutline } from 'react-icons/md';
import { removeFromCart, updateCartItemQuantity } from '../redux/userSlice';
import { toast } from 'react-toastify';

function CartItemCard({ data }) {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(data.quantity);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setQuantity(data.quantity);
  }, [data.quantity]);

  const handleIncrement = async () => {
    const newQuantity = quantity + 1;
    setIsUpdating(true);
    setQuantity(newQuantity);

    try {
      await dispatch(updateCartItemQuantity({ id: data.id, quantity: newQuantity }));
    } catch (error) {
      setQuantity(quantity); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecrement = async () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setIsUpdating(true);
      setQuantity(newQuantity);

      try {
        await dispatch(updateCartItemQuantity({ id: data.id, quantity: newQuantity }));
      } catch (error) {
        setQuantity(quantity); // Revert on error
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(removeFromCart(data.id));
      toast.success(`${data.name} removed from cart!`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      setIsDeleting(false);
      toast.error('Failed to remove item from cart', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const totalPrice = (data.price * quantity).toFixed(2);

  

  return (
    <div className={`flex flex-col items-start justify-between gap-4 p-3 mt-5 bg-white shadow-sm sm:flex-row sm:items-center sm:gap-3 sm:p-4 rounded-xl hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-gray-200 ${isUpdating ? 'opacity-75' : ''}`}>
      {/* Image & Details Section */}
      <div className='flex items-center flex-1 min-w-0 gap-3 sm:gap-4'>
        <div className='relative'>
          <img
            src={data.image}
            alt={data.name}
            className='flex-shrink-0 object-cover w-16 h-16 rounded-lg shadow-sm sm:w-20 sm:h-20'
          />
          {isUpdating && (
            <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-lg'>
              <div className='w-4 h-4 border-2 border-blue-500 rounded-full border-t-transparent animate-spin'></div>
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className='flex-1 min-w-0'>
          <h1 className='text-sm font-semibold leading-tight text-gray-800 truncate sm:text-base'>{data.name}</h1>
          <p className='mt-1 text-xs text-gray-600 sm:text-sm'>₹{data.price} each</p>
          <p className='mt-1 text-xs font-bold text-gray-800 sm:hidden'>₹{totalPrice}</p>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className='flex items-center gap-2 sm:gap-3'>
        <button
          onClick={handleDecrement}
          disabled={quantity <= 1 || isUpdating}
          className='flex items-center justify-center flex-shrink-0 text-sm font-bold text-red-600 transition-all duration-200 bg-red-100 rounded-full w-7 h-7 sm:w-8 sm:h-8 sm:text-base hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'
        >
          −
        </button>
        <div className='relative'>
          <span className='block text-xs font-medium text-center text-gray-800 w-7 sm:w-8 sm:text-sm'>{quantity}</span>
          {isUpdating && (
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='w-3 h-3 border border-blue-500 rounded-full border-t-transparent animate-spin'></div>
            </div>
          )}
        </div>
        <button
          onClick={handleIncrement}
          disabled={isUpdating}
          className='flex items-center justify-center flex-shrink-0 text-sm font-bold text-green-600 transition-all duration-200 bg-green-100 rounded-full w-7 h-7 sm:w-8 sm:h-8 sm:text-base hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'
        >
          +
        </button>
      </div>

      {/* Price - Hidden on mobile */}
      <div className='hidden sm:block text-right min-w-[90px]'>
        <p className='mb-1 text-xs text-gray-600 sm:text-sm'>{quantity} × ₹{data.price}</p>
        <p className='text-base font-bold text-gray-800 sm:text-lg'>₹{totalPrice}</p>
      </div>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className='p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 flex-shrink-0 hover:text-red-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
        title='Remove from cart'
      >
        <MdDeleteOutline size={20} className='sm:hidden' />
        <MdDeleteOutline size={24} className='hidden sm:block' />
      </button>
    </div>
  );
}

export default CartItemCard;
