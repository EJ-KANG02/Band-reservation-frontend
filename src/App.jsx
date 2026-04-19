import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

const OnboardingPage      = lazy(() => import('./pages/OnboardingPage'))
const LoginPage           = lazy(() => import('./pages/LoginPage'))
const OAuthCallbackPage   = lazy(() => import('./pages/OAuthCallbackPage'))
const SignupSelectPage     = lazy(() => import('./pages/SignupSelectPage'))
const MemberSignupPage    = lazy(() => import('./pages/MemberSignupPage'))
const OfficerSignupPage   = lazy(() => import('./pages/OfficerSignupPage'))
const PendingApprovalPage = lazy(() => import('./pages/PendingApprovalPage'))
const MainPage            = lazy(() => import('./pages/MainPage'))
const MyPage              = lazy(() => import('./pages/MyPage'))
const ProfileEditPage     = lazy(() => import('./pages/ProfileEditPage'))
const WithdrawPage        = lazy(() => import('./pages/WithdrawPage'))
const WeeklySchedulePage  = lazy(() => import('./pages/WeeklySchedulePage'))
const ReservationPage     = lazy(() => import('./pages/ReservationPage'))
const MyReservationsPage  = lazy(() => import('./pages/MyReservationsPage'))
const ContactPage         = lazy(() => import('./pages/ContactPage'))
const SettingPage         = lazy(() => import('./pages/SettingPage'))

export default function App() {
  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-black relative">
      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <Routes>
          <Route path="/"                    element={<OnboardingPage />} />
          <Route path="/onboarding"          element={<OnboardingPage />} />
          <Route path="/login"               element={<LoginPage />} />
          <Route path="/oauth/callback"      element={<OAuthCallbackPage />} />
          <Route path="/signup"              element={<SignupSelectPage />} />
          <Route path="/signup/member"       element={<MemberSignupPage />} />
          <Route path="/signup/officer"      element={<OfficerSignupPage />} />
          <Route path="/pending"             element={<PendingApprovalPage />} />
          <Route path="/home"                element={<MainPage />} />
          <Route path="/mypage"              element={<MyPage />} />
          <Route path="/mypage/edit"         element={<ProfileEditPage />} />
          <Route path="/withdraw"            element={<WithdrawPage />} />
          <Route path="/schedule"            element={<WeeklySchedulePage />} />
          <Route path="/reservation"         element={<ReservationPage />} />
          <Route path="/mypage/reservations" element={<MyReservationsPage />} />
          <Route path="/mypage/contact"      element={<ContactPage />} />
          <Route path="/mypage/setting"      element={<SettingPage />} />
        </Routes>
      </Suspense>
    </div>
  )
}
