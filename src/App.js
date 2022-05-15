import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { isMobile } from 'react-device-detect';

import Front from './pages/front';

// info pages
import Intro from './pages/landing/intro';
import Privacy from './pages/landing/privacy';

// user pages
import Usermain from './pages/user/main';
import Restaurantprofile from './pages/user/restaurants/profile';
import Itemprofile from './components/user/itemprofile';
import Seeorders from './pages/user/seeorders'

import Salonprofile from './pages/user/salons/profile';
import UserBooktime from './pages/user/salons/booktime';

import Storeprofile from './pages/user/stores/profile';

import Account from './pages/user/account';
import Orders from './components/user/orders'

// business pages
import Auth from './pages/business/auth'
import Login from './pages/business/login'
import Register from './pages/business/register'
import Forgotpassword from './pages/business/forgotpassword'
import Resetpassword from './pages/business/resetpassword'
import Verifyowner from './pages/business/verifyowner'
import List from './pages/business/list'
import Locationsetup from './pages/business/locationsetup'

import Businessmain from './pages/business/main'
import BusinessBooktime from './pages/business/booktime';
import Cartorders from './pages/business/cartorders'

// salons' components
import Addmenu from './components/business/addmenu'
import Addproduct from './components/business/addproduct'
import Addservice from './components/business/addservice'

import Menu from './pages/business/menu'
import Settings from './pages/business/settings'

export default function App() {
  const [route, setRoute] = useState(null)

  useEffect(() => {
    if (!isMobile) {
      const ownerid = localStorage.getItem("ownerid")
      const phase = localStorage.getItem("phase")

      if (ownerid) {
        if (phase) {
          setRoute(phase)
        } else {
          setRoute("auth")
        }
      } else {
        setRoute("auth")
      }
    }
  }, [])

  return (
    isMobile ? 
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Usermain/>}/>
          <Route path="/seeorders/:ordernumber" element={<Seeorders/>}/>
          <Route path="/restaurantprofile/:locationid" element={<Restaurantprofile/>}/>
          <Route path="/itemprofile/:locationid/:menuid/:productid/:productinfo/:type" element={<Itemprofile/>}/>
          <Route path="/orders" element={<Orders/>}/>
          <Route path="/salonprofile/:locationid" element={<Salonprofile/>}/>
          <Route path="/storeprofile/:locationid" element={<Storeprofile/>}/>
          <Route path="/booktime/:locationid/:scheduleid/:menuid/:serviceid/:serviceinfo" element={<UserBooktime/>}/>
          <Route path="/account" element={<Account/>}/>
        </Routes>
      </BrowserRouter>
      :
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Front/>}/>
          <Route path="/intro" element={<Intro/>}/>
          <Route path="/privacy" element={<Privacy/>}/>

          <Route path="/auth" element={<Auth/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/forgotpassword" element={<Forgotpassword/>}/>
          <Route path="/resetpassword/:cellnumber" element={<Resetpassword/>}/>
          <Route path="/verifyowner" element={<Verifyowner/>}/>
          <Route path="/list" element={<List/>}/>
          <Route path="/locationsetup" element={<Locationsetup/>}/>
          <Route path="/main" element={<Businessmain/>}/>
          <Route path="/booktime/:scheduleid/:serviceid/:serviceinfo" element={<BusinessBooktime/>}/>
          <Route path="/cartorders/:userid/:ordernumber" element={<Cartorders/>}/>
          <Route path="/addmenu/:parentMenuid/:menuid" element={<Addmenu/>}/>
          <Route path="/addproduct/:parentMenuid/:productid" element={<Addproduct/>}/>
          <Route path="/addservice/:parentMenuid/:serviceid" element={<Addservice/>}/>
          <Route path="/menu" element={<Menu/>}/>
          <Route path="/settings" element={<Settings/>}/>
        </Routes>
      </BrowserRouter>
  );
}
