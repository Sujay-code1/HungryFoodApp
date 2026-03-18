import {Routes, Route} from 'react-router-dom'
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ForgotPassword from './pages/ForgotPassword';

export const serverUrl = "http://localhost:8000"

function App() {
  return (
    <>
   <Routes>
     <Route path='/signup' element={<SignUp/>}/>
     <Route path='/signin' element={<SignIn/>}/>
     <Route path='/forgot-password' element={<ForgotPassword/>}/>
   </Routes>

    <ToastContainer position="top-right" autoClose={3000} />

    </>
  )
}

export default App;
