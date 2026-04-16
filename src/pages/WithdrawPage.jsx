import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { withdraw } from '../api/auth'
import { supabase } from '../lib/supabase'
import BackButton from '../components/BackButton'

export default function WithdrawPage() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleWithdrawConfirm = async () => {
    setLoading(true)
    setError('')
    try {
      await withdraw()
      // 성공 → 로컬 세션 정리 후 온보딩으로
      localStorage.clear()
      await supabase.auth.signOut()
      navigate('/', { replace: true })
    } catch (err) {
      const status = err.response?.status
      if (status === 403) {
        setError('세션이 만료되었습니다. 다시 로그인 후 시도해주세요.')
      } else {
        setError(err.response?.data?.message || '탈퇴 처리 중 오류가 발생했습니다.')
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col px-6 safe-top safe-bottom pb-8">
      <div className="pt-12 mb-6">
        <BackButton />
      </div>
      <h1 className="text-xl font-bold text-white mb-10">회원탈퇴</h1>

      {/* 안내 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <InfoIcon />

        <div className="mt-6 mb-12 space-y-2">
          <p className="text-zinc-300 text-sm leading-relaxed">
            현재 서비스를 탈퇴하시면 사용자에 대한<br />모든 기록이 삭제됩니다.
          </p>
          <p className="text-zinc-500 text-sm leading-relaxed">
            그리고 해당 기록은 복구되실 수 없습니다.
          </p>
          <p className="text-zinc-500 text-sm leading-relaxed mt-4">
            그래도 피어리스던 합주 예약 서비스를<br />탈퇴하려면 아래 버튼을 눌러주세요.
          </p>
        </div>

        {/* FD 로고 */}
        <FDLogo className="mb-10" />
        <p className="text-zinc-700 text-xs tracking-[0.2em] font-medium mb-12">FEARLESS DAWN</p>
      </div>

      {error && (
        <p className="text-red-400 text-sm text-center mb-3">{error}</p>
      )}

      <button
        onClick={() => setShowModal(true)}
        className="w-full py-4 bg-zinc-900 text-zinc-400 rounded-2xl text-sm font-medium
                   border border-zinc-800 active:bg-zinc-800 transition-colors"
      >
        탈퇴하기
      </button>

      {/* 탈퇴 확인 모달 */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-end justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-[390px] bg-zinc-900 rounded-t-3xl px-6 pt-8 pb-10 border-t border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white text-base font-semibold text-center mb-8">
              정말 탈퇴하시겠습니까?
            </p>
            <button
              onClick={handleWithdrawConfirm}
              disabled={loading}
              className="w-full py-4 bg-white text-black rounded-2xl text-base font-bold
                         active:bg-zinc-100 transition-colors disabled:opacity-50 mb-4"
            >
              {loading ? '처리 중...' : '탈퇴'}
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 text-zinc-500 text-sm active:text-zinc-300 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function FDLogo({ className = '' }) {
  return (
    <img
      src="/fd-logo.png"
      alt="FEARLESS DAWN"
      width={60}
      height={60}
      className={className}
      style={{ objectFit: 'contain', opacity: 0.3 }}
    />
  )
}

function InfoIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="20" stroke="#52525b" strokeWidth="2.5" />
      <path d="M24 22v12" stroke="#52525b" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="16" r="1.5" fill="#52525b" />
    </svg>
  )
}
