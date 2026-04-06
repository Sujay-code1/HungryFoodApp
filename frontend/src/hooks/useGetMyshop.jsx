import { useEffect } from 'react';
import axios from "axios";
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setMyShopData } from '../redux/userSlice';

function useGetMyshop() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/shop/get-my-shop`,
          { withCredentials: true }
        );
    
        dispatch(setMyShopData(result.data))
        
      } catch (error) {
        console.log("Error fetching user:", error);
      }
    };

    fetchShop();
  }, []);
}

export default useGetMyshop;