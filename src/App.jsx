import { Routes, Route } from 'react-router-dom'
import OnboardingPage from './pages/OnboardingPage'
import LoginPage from './pages/LoginPage'
import OAuthCallbackPage from './pages/OAuthCallbackPage'
import SignupSelectPage from './pages/SignupSelectPage'
import MemberSignupPage from './pages/MemberSignupPage'
import OfficerSignupPage from './pages/OfficerSignupPage'
import PendingApprovalPage from './pages/PendingApprovalPage'
import MainPage from './pages/MainPage'
import MyPage from './pages/MyPage'
import ProfileEditPage from './pages/ProfileEditPage'
import WithdrawPage from './pages/WithdrawPage'
import WeeklySchedulePage from './pages/WeeklySchedulePage'
import ReservationPage from './pages/ReservationPage'
import MyReservationsPage from './pages/MyReservationsPage'
import ContactPage from './pages/ContactPage'
import SettingPage from './pages/SettingPage'

export default function App() {
  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-black relative">
      <Routes>
        <Route path="/" element={<OnboardingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/signup" element={<SignupSelectPage />} />
        <Route path="/signup/member" element={<MemberSignupPage />} />
        <Route path="/signup/officer" element={<OfficerSignupPage />} />
        <Route path="/pending" element={<PendingApprovalPage />} />
        <Route path="/home" element={<MainPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypage/edit" element={<ProfileEditPage />} />
        <Route path="/withdraw" element={<WithdrawPage />} />
        <Route path="/schedule" element={<WeeklySchedulePage />} />
        <Route path="/reservation" element={<ReservationPage />} />
        <Route path="/mypage/reservations" element={<MyReservationsPage />} />
        <Route path="/mypage/contact" element={<ContactPage />} />
        <Route path="/mypage/setting" element={<SettingPage />} />
      </Routes>
    </div>
  )
}
