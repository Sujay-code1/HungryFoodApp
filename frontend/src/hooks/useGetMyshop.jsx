import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from "axios";
import { serverUrl } from '../config';
import { useDispatch, useSelector } from 'react-redux';
import { setMyShopData } from '../redux/shopSlice';

function useGetMyshop() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const location = useLocation();

  useEffect(() => {
    if (!userData || userData.role !== 'owner') return;
    if (location.pathname !== '/') return;

    const fetchShop = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/shop/get-my-shop`,
          { withCredentials: true }
        );

        dispatch(setMyShopData(result.data));
      } catch (error) {
        console.error("Error fetching shop:", error?.response?.data || error.message || error);
      }
    };

    fetchShop();
  }, [userData, dispatch, location.pathname]);
}

export default useGetMyshop;