import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout, getUserInfo } from '../api/auth'
import { supabase } from '../lib/supabase'
import BackButton from '../components/BackButton'

const POSITION_LABEL = {
  PRESIDENT:       '회장',
  VICE_PRESIDENT:  '부회장',
  TREASURER:       '총무',
}

export default function MyPage() {
  const navigate = useNavigate()
  const nickname = localStorage.getItem('userNickname') || '사용자'
  const teamName = localStorage.getItem('userTeamName') || 'FEARLESS DAWN'
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '')
  const batch    = localStorage.getItem('userBatch')    || ''
  const position = localStorage.getItem('userPosition') || ''
  const officerLabel = userRole === 'OFFICER' && batch && position
    ? `${batch}기 ${POSITION_LABEL[position] ?? position}`
    : null
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('userRole')) {
      getUserInfo().then(res => {
        if (res.isSuccess && res.result) {
          const r = res.result
          localStorage.setItem('userRole',     r.role              || '')
          localStorage.setItem('userBatch',    r.batch != null ? String(r.batch) : '')
          localStorage.setItem('userPosition', r.position          || '')
          setUserRole(r.role || '')
        }
      }).catch(() => {})
    }
  }, [])
  const [logoutLoading, setLogoutLoading] = useState(false)

  const handleLogoutConfirm = async () => {
    setLogoutLoading(true)
    try {
      await logout()
    } catch (_) {
      // 백엔드 오류여도 로컬 세션 정리
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userNickname')
    localStorage.removeItem('userTeamName')
    localStorage.removeItem('userName')
    localStorage.removeItem('userStudentId')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userBatch')
    localStorage.removeItem('userPosition')
    await supabase.auth.signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-black flex flex-col px-6 safe-top safe-bottom pb-8">
      {/* 헤더 */}
      <div className="pt-12 mb-6">
        <BackButton />
      </div>
      <h1 className="text-xl font-bold text-white mb-6">내 정보</h1>

      {/* 프로필 */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5">
          <p className="text-2xl font-bold text-white">{nickname}</p>
          {officerLabel && (
            <span className="text-xs font-medium text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-full">
              {officerLabel}
            </span>
          )}
        </div>
        <p className="text-zinc-500 text-sm mt-1">{teamName}</p>
      </div>

      {/* 메뉴 */}
      <div className="flex flex-col gap-1 mb-6">
        <MenuItem
          icon={<SettingIcon />}
          label="회원정보 수정"
          onClick={() => navigate('/mypage/edit')}
        />
        <MenuItem
          icon={<CalendarIcon />}
          label="예약 확인/취소"
          onClick={() => navigate('/mypage/reservations')}
        />
        {userRole === 'OFFICER' && (
          <MenuItem
            icon={<GearIcon />}
            label="예약 설정"
            onClick={() => navigate('/mypage/setting')}
          />
        )}
        <MenuItem
          icon={<ChatIcon />}
          label="문의하기"
          onClick={() => navigate('/mypage/contact')}
        />
      </div>

      <div className="h-px bg-zinc-800 mb-6" />

      <div className="flex flex-col gap-1">
        <MenuItem
          icon={<LogoutIcon />}
          label="로그아웃"
          onClick={() => setShowLogoutModal(true)}
          labelClass="text-zinc-400"
        />
        <MenuItem
          icon={<WithdrawIcon />}
          label="회원탈퇴"
          onClick={() => navigate('/withdraw')}
          labelClass="text-zinc-400"
        />
      </div>

      {/* 푸터 */}
      <div className="mt-auto pt-8 text-center">
        <p className="text-zinc-700 text-xs tracking-[0.2em] font-medium">FEARLESS DAWN</p>
      </div>

      {/* 로그아웃 확인 모달 */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-8"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="w-full bg-zinc-900 rounded-3xl p-6 border border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white text-base font-semibold text-center mb-6">
              로그아웃 하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleLogoutConfirm}
                disabled={logoutLoading}
                className="flex-1 py-3 bg-white text-black rounded-2xl text-sm font-bold
                           active:bg-zinc-100 transition-colors disabled:opacity-50"
              >
                {logoutLoading ? '처리 중...' : '네'}
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 bg-zinc-800 text-zinc-300 rounded-2xl text-sm font-medium
                           active:bg-zinc-700 transition-colors"
              >
                아니오
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItem({ icon, label, onClick, labelClass = 'text-white' }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 w-full py-4 px-1 active:bg-zinc-900 rounded-xl transition-colors text-left"
    >
      <span className="text-zinc-500 w-5 flex items-center justify-center">{icon}</span>
      <span className={`flex-1 text-sm font-medium ${labelClass}`}>{label}</span>
      <ChevronRight />
    </button>
  )
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  )
}

function SettingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  )
}

function WithdrawIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 11l-4-4m0 4l4-4" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path strokeLinecap="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
