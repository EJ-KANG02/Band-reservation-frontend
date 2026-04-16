import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserInfo } from '../api/auth'
import FDLogo from '../components/FDLogo'

export default function MainPage() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState(localStorage.getItem('userNickname') || '')

  useEffect(() => {
    getUserInfo()
      .then((res) => {
        if (res.isSuccess && res.result) {
          const r = res.result
          setNickname(r.nickname || '')
          if (r.nickname)  localStorage.setItem('userNickname',  r.nickname)
          if (r.teamName)  localStorage.setItem('userTeamName',  r.teamName)
          if (r.name)      localStorage.setItem('userName',      r.name)
          if (r.studentId) localStorage.setItem('userStudentId', r.studentId)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-black flex flex-col px-6 safe-top safe-bottom">

      {/* 마이페이지 버튼 */}
      <button
        onClick={() => navigate('/mypage')}
        className="self-end mt-12 text-zinc-500 active:text-white transition-colors"
        aria-label="마이페이지"
      >
        <PersonIcon />
      </button>

      {/* 로고 + 인사 — 화면 중앙 */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <FDLogo size={52} />
        <p className="text-white text-[26px] font-bold tracking-[0.3em] leading-snug mt-6">
          FEARLESS
        </p>
        <p className="text-white text-[26px] font-bold tracking-[0.3em] leading-snug">
          DAWN
        </p>

        {nickname ? (
          <p className="text-zinc-500 text-sm mt-5">
            안녕하세요,{' '}
            <span className="text-zinc-300 font-medium">{nickname}</span>님
          </p>
        ) : (
          <p className="text-zinc-700 text-xs mt-5 tracking-widest">합주 · 드럼 예약 서비스</p>
        )}
      </div>

      {/* 하단 액션 버튼 */}
      <div className="pb-14 flex flex-col gap-3">
        <ActionButton
          label="예약 현황"
          icon={<CalendarIcon />}
          onClick={() => navigate('/schedule')}
          variant="secondary"
        />
        <ActionButton
          label="예약하러 가기"
          icon={<NoteIcon />}
          onClick={() => navigate('/reservation')}
          variant="primary"
        />
      </div>
    </div>
  )
}

function ActionButton({ label, icon, onClick, variant }) {
  const base = `w-full h-[54px] rounded-2xl text-[15px] font-bold
                flex items-center justify-between px-5
                active:scale-[0.98] transition-all`
  const styles = variant === 'primary'
    ? `${base} bg-white text-black active:bg-zinc-100`
    : `${base} bg-zinc-900 text-white border border-zinc-800 active:bg-zinc-800`

  return (
    <button onClick={onClick} className={styles}>
      <span>{label}</span>
      <span className="text-current opacity-60">{icon}</span>
    </button>
  )
}

function PersonIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path strokeLinecap="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function NoteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 19V6l12-3v13M9 19a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm12 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
    </svg>
  )
}
