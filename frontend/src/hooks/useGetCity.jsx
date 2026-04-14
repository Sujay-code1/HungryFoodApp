import { useEffect } from 'react';
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { setLocation } from '../redux/userSlice';

function useGetCity() {
  const dispatch = useDispatch();
  const {userData} = useSelector((state) => state.user);
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const response = await axios.get(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
        );

        const result = response?.data?.results?.[0] || {};
        const city = result.city || result.properties?.city || '';
        const state = result.state || result.properties?.state || '';

        dispatch(setLocation({ city, state }));
      } catch (error) {
        console.error("Failed to fetch city/state:", error);
      }
    });
  }, [userData]);
}

export default useGetCity;