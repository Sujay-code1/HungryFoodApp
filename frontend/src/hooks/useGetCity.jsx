import { useEffect } from 'react';
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { setLocation } from '../redux/userSlice';
import { setLocation as setMapLocation, setAddress } from '../redux/mapslice';

function useGetCity() {
  const dispatch = useDispatch();
  const {userData} = useSelector((state) => state.user);
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      dispatch(setMapLocation({ lon: longitude, lat: latitude }));
      try {
        const geoUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
        const geoResp = await axios.get(geoUrl)
        const geoData = geoResp.data

        const result = geoData?.results?.[0] || geoData?.features?.[0] || {};
        const city = result.city || result.properties?.city || result.address?.city || '';
        const state = result.state || result.properties?.state || result.address?.state || '';
        const address = result.formatted || result.formatted_address || result.address || result.properties?.formatted || result.properties?.formatted_address || result.address_line1 || '';

        dispatch(setLocation({ city, state }));
        dispatch(setAddress(address));
         


      } catch (error) {
        console.error("Failed to fetch city/state:", error);
        // Set default location if API fails
        dispatch(setLocation({ city: 'Cuttack', state: 'Odisha' }));
        dispatch(setAddress(''));
      
      }

          
    }, (error) => {
      console.error("Geolocation error:", error);
      // Set default location if geolocation fails
      dispatch(setLocation({ city: 'Cuttack', state: 'Odisha' }));
      dispatch(setAddress(''));
    });
  }, [userData, dispatch]);
}

export default useGetCity;