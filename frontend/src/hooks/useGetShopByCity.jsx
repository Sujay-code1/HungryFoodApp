import { useEffect } from 'react';
import axios from "axios";
import { serverUrl } from '../config';
import { useDispatch, useSelector } from 'react-redux';
import { setShopInMyCity } from '../redux/userSlice';

function useGetShopByCity() {
  const dispatch = useDispatch();
   const currentCity = useSelector(state => state.user.city);
  useEffect(() => {
    if (!currentCity) return;
    const fetchShops = async () => {
       
      try {
        const result = await axios.get(
          `${serverUrl}/api/shop/get-by-city/${currentCity}`,
          { withCredentials: true }
        );
    
        dispatch(setShopInMyCity(result.data))
        console.log(result.data)
        
      } catch (error) {
        console.log("Error fetching Shop:", error);
      }
    };

    fetchShops();
  }, [currentCity]);
}

export default useGetShopByCity;