import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DoctorSignup from './pages/DoctorSignup';
import VerifyEmail from './pages/VerifyEmail';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminDoctors from './pages/admin/Doctors';
import AdminProducts from './pages/admin/Products';
import AdminProductDetails from './pages/admin/ProductDetails';
import AdminOrders from './pages/admin/Orders';
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorSchedule from './pages/doctor/DoctorSchedule';
import DoctorSettings from './pages/doctor/Settings';

import UserDashboard from './pages/user/Dashboard';
import AdoptionFeed from './pages/user/AdoptionFeed';
import FindDoctors from './pages/user/FindDoctors';
import AdoptionRequests from './pages/user/AdoptionRequests';
import UserShop from './pages/user/Shop';
import UserCart from './pages/user/Cart';
import UserOrders from './pages/user/Orders';
import UserAppointments from './pages/user/Appointments';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import ProductDetails from './pages/common/ProductDetails';
import PetDetails from './pages/common/PetDetails';
import Favorites from './pages/user/Favorites';
import ChatPage from './pages/user/ChatPage';
import Messages from './pages/user/Messages';




function App() {
  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/doctor-signup" element={<DoctorSignup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failure" element={<PaymentFailure />} />


          {/* Protected Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/doctors" element={<AdminDoctors />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/:id" element={<AdminProductDetails />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/schedule" element={<DoctorSchedule />} />
            <Route path="/doctor/messages" element={<Messages />} />
            <Route path="/doctor/messages/:id" element={<Messages />} />
            <Route path="/doctor/settings" element={<DoctorSettings />} />

            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/adoption" element={<AdoptionFeed />} />
            <Route path="/user/doctors" element={<FindDoctors />} />
            <Route path="/user/appointments" element={<UserAppointments />} />
            <Route path="/user/requests" element={<AdoptionRequests />} />
            <Route path="/user/chat/:id" element={<ChatPage />} />
            <Route path="/user/messages" element={<Messages />} />
            <Route path="/user/messages/:id" element={<Messages />} />
            <Route path="/user/favorites" element={<Favorites />} />
            <Route path="/user/shop" element={<UserShop />} />
            <Route path="/user/cart" element={<UserCart />} />
            <Route path="/user/orders" element={<UserOrders />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/pets/:id" element={<PetDetails />} />

            {/* Add more nested routes here as needed */}
            {/* <Route path="/admin/users" element={<UsersList />} /> */}
          </Route>

        </Routes>
      </div>
    </>

  );
}
export default App;


