import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';

// Lazy-loaded pages — each becomes its own async chunk
const Landing           = lazy(() => import('./pages/Landing'));
const Login             = lazy(() => import('./pages/Login'));
const Signup            = lazy(() => import('./pages/Signup'));
const DoctorSignup      = lazy(() => import('./pages/DoctorSignup'));
const RescuerSignup     = lazy(() => import('./pages/RescuerSignup'));
const VerifyEmail       = lazy(() => import('./pages/VerifyEmail'));
const PaymentSuccess    = lazy(() => import('./pages/PaymentSuccess'));
const PaymentFailure    = lazy(() => import('./pages/PaymentFailure'));

// Admin
const AdminDashboard      = lazy(() => import('./pages/admin/Dashboard'));
const AdminDoctors        = lazy(() => import('./pages/admin/Doctors'));
const AdminProducts       = lazy(() => import('./pages/admin/Products'));
const AdminProductDetails = lazy(() => import('./pages/admin/ProductDetails'));
const AdminOrders         = lazy(() => import('./pages/admin/Orders'));
const AdminUsers          = lazy(() => import('./pages/admin/Users'));
const AdminCampaigns      = lazy(() => import('./pages/admin/Campaigns'));

// Doctor
const DoctorDashboard     = lazy(() => import('./pages/doctor/Dashboard'));
const DoctorAppointments  = lazy(() => import('./pages/doctor/Appointments'));
const DoctorPatients      = lazy(() => import('./pages/doctor/Patients'));
const DoctorSettings      = lazy(() => import('./pages/doctor/Settings'));

// User
const UserDashboard      = lazy(() => import('./pages/user/Dashboard'));
const AdoptionFeed       = lazy(() => import('./pages/user/AdoptionFeed'));
const FindDoctors        = lazy(() => import('./pages/user/FindDoctors'));
const AdoptionRequests   = lazy(() => import('./pages/user/AdoptionRequests'));
const UserShop           = lazy(() => import('./pages/user/Shop'));
const UserCart           = lazy(() => import('./pages/user/Cart'));
const UserOrders         = lazy(() => import('./pages/user/Orders'));
const UserAppointments   = lazy(() => import('./pages/user/Appointments'));
const ChatPage           = lazy(() => import('./pages/user/ChatPage'));
const Messages           = lazy(() => import('./pages/user/Messages'));
const PetRescue          = lazy(() => import('./pages/user/PetRescue'));
const UserCampaigns      = lazy(() => import('./pages/user/Campaigns'));
const CampaignDetail     = lazy(() => import('./pages/user/CampaignDetail'));
const Favorites          = lazy(() => import('./pages/user/Favorites'));

// Rescuer
const RescuerDashboard  = lazy(() => import('./pages/rescuer/Dashboard'));
const AvailableRescues  = lazy(() => import('./pages/rescuer/AvailableRescues'));
const MyMissions        = lazy(() => import('./pages/rescuer/MyMissions'));
const RescuerBadges     = lazy(() => import('./pages/rescuer/Badges'));

// Common
const ProductDetails  = lazy(() => import('./pages/common/ProductDetails'));
const PetDetails      = lazy(() => import('./pages/common/PetDetails'));
const CommonSettings  = lazy(() => import('./pages/common/Settings'));

// Minimal fallback shown while any lazy page loads
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"                  element={<Landing />} />
            <Route path="/login"             element={<Login />} />
            <Route path="/signup"            element={<Signup />} />
            <Route path="/rescuer-signup"    element={<RescuerSignup />} />
            <Route path="/doctor-signup"     element={<DoctorSignup />} />
            <Route path="/verify-email"      element={<VerifyEmail />} />
            <Route path="/payment/success"   element={<PaymentSuccess />} />
            <Route path="/payment/failure"   element={<PaymentFailure />} />

            {/* Protected Dashboard Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/admin/dashboard"       element={<AdminDashboard />} />
              <Route path="/admin/doctors"         element={<AdminDoctors />} />
              <Route path="/admin/products"        element={<AdminProducts />} />
              <Route path="/admin/products/:id"    element={<AdminProductDetails />} />
              <Route path="/admin/orders"          element={<AdminOrders />} />
              <Route path="/admin/users"           element={<AdminUsers />} />
              <Route path="/admin/campaigns"       element={<AdminCampaigns />} />
              <Route path="/admin/settings"        element={<CommonSettings />} />

              <Route path="/doctor/dashboard"      element={<DoctorDashboard />} />
              <Route path="/doctor/appointments"   element={<DoctorAppointments />} />
              <Route path="/doctor/patients"       element={<DoctorPatients />} />
              <Route path="/doctor/messages"       element={<Messages />} />
              <Route path="/doctor/messages/:id"   element={<Messages />} />
              <Route path="/doctor/settings"       element={<DoctorSettings />} />

              <Route path="/user/dashboard"        element={<UserDashboard />} />
              <Route path="/user/adoption"         element={<AdoptionFeed />} />
              <Route path="/user/doctors"          element={<FindDoctors />} />
              <Route path="/user/appointments"     element={<UserAppointments />} />
              <Route path="/user/rescue"           element={<PetRescue />} />
              <Route path="/user/requests"         element={<AdoptionRequests />} />
              <Route path="/user/chat/:id"         element={<ChatPage />} />
              <Route path="/user/messages"         element={<Messages />} />
              <Route path="/user/messages/:id"     element={<Messages />} />
              <Route path="/user/favorites"        element={<Favorites />} />
              <Route path="/user/shop"             element={<UserShop />} />
              <Route path="/user/cart"             element={<UserCart />} />
              <Route path="/user/orders"           element={<UserOrders />} />
              <Route path="/user/campaigns"        element={<UserCampaigns />} />
              <Route path="/user/campaigns/:id"    element={<CampaignDetail />} />
              <Route path="/user/settings"         element={<CommonSettings />} />

              <Route path="/product/:id"           element={<ProductDetails />} />
              <Route path="/pets/:id"              element={<PetDetails />} />

              <Route path="/rescuer/dashboard"     element={<RescuerDashboard />} />
              <Route path="/rescuer/available"     element={<AvailableRescues />} />
              <Route path="/rescuer/missions"      element={<MyMissions />} />
              <Route path="/rescuer/badges"        element={<RescuerBadges />} />
              <Route path="/rescuer/settings"      element={<CommonSettings />} />
            </Route>
          </Routes>
        </Suspense>
      </div>
    </>
  );
}

export default App;
