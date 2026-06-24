import {Routes, Route, Navigate} from 'react-router-dom'
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Home from './pages/Home';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ForgotPassword from './pages/ForgotPassword';
import useGetCurrentUser from './hooks/useGetCurrentUser';
import { useSelector } from 'react-redux';
import useGetCity from './hooks/useGetCity';
import useGetMyshop from './hooks/useGetMyshop';
import CreateEditShop from './pages/CreateEditShop';
import AddItem from './pages/AddItem';
import EditItem from './pages/EditItem';
import useGetShopByCity from './hooks/useGetShopByCity';
import CartPage from './pages/CartPage';
import CheckOut from './pages/CheckOut';
import OrderPlaced from './pages/OrderPlaced';
import MyOrders from './pages/MyOrders';
import useGetMyOrders from './hooks/useGetMyOrders';

function App() {
 

  useGetCurrentUser()
  useGetCity()
  useGetMyshop()
  useGetShopByCity()
  useGetMyOrders()


  const {userData}=useSelector(state=>state.user)
  
  return (
    <>
   <Routes>
     <Route path='/signup' element={!userData ? <SignUp/> : <Navigate to={"/"}/>}/>
     <Route path='/signin' element={!userData ? <SignIn/> : <Navigate to={"/"}/>}/>
     <Route path='/forgot-password' element={!userData ? <ForgotPassword/> : <Navigate to={"/"}/>}/>
     <Route path='/' element={userData ? <Home/>:<Navigate to={"/signin"}/>}/>
     <Route path='/create-edit-shop' element={userData ? <CreateEditShop/>:<Navigate to={"/signin"}/>}/>
     <Route path='/add-item' element={userData ? <AddItem/>:<Navigate to={"/signin"}/>}/>
     <Route path='/edit-item/:id' element={userData ? <EditItem/>:<Navigate to={"/signin"}/>}/>
    <Route path='/cart' element={<CartPage/>}/>
     <Route path='/checkout' element={userData ? <CheckOut/>:<Navigate to={"/signin"}/>}/>
     <Route path='/order-placed' element={userData ? <OrderPlaced/>:<Navigate to={"/signin"}/>}/>
     <Route path='/my-orders' element={userData ? <MyOrders/>:<Navigate to={"/signin"}/>}/>
     
   </Routes>

    <ToastContainer position="top-right" autoClose={3000} />

    </>
  )
}

export default App;
