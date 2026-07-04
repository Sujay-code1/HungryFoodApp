import { useEffect } from 'react';
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { setLocation } from '../redux/userSlice';
import { setLocation as setMapLocation, setAddress } from '../redux/mapslice';
import { serverUrl } from '../config';

function useUpdateLocation() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    const updateLocation = async (lat, lon) => {
      try {
        const result = await axios.post(
          `${serverUrl}/user/update-location`,
          {
            lat: lat,
            lon: lon
          },
          { withCredentials: true }
        );

        console.log(result.data);
      } catch (error) {
        console.log(error);
      }
    };

    navigator.geolocation.watchPosition((pos) => {
      updateLocation(
        pos.coords.latitude,
        pos.coords.longitude
      );
    });

  }, [userData, dispatch]);
}

export default useUpdateLocation;