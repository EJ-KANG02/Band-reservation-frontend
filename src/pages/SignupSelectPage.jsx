import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SignupSelectPage() {
  const navigate = useNavigate()
  const kakaoId = sessionStorage.getItem('kakaoId')
  const kakaoNickname = sessionStorage.getItem('kakaoNickname')

  useEffect(() => {
    if (!kakaoId) navigate('/login', { replace: true })
  }, [kakaoId, navigate])

  if (!kakaoId) return null

  return (
    <div className="min-h-screen bg-black flex flex-col px-6 pt-16 pb-10">

      {/* 카카오 연결 완료 배지 */}
      <div className="inline-flex items-center gap-2 self-start
                      bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
        <span className="text-zinc-400 text-xs">카카오 계정 연결 완료</span>
      </div>

      {/* 환영 메시지 */}
      <div className="mb-10">
        <h1 className="text-white text-2xl font-bold leading-snug">
          {kakaoNickname ? (
            <><span className="text-zinc-300">{kakaoNickname}</span>님,<br /></>
          ) : null}
          피어리스던에<br />오신 것을 환영합니다.
        </h1>
        <p className="text-zinc-500 text-sm mt-3">
          아래에서 가입 유형을 선택해주세요.
        </p>
      </div>

      {/* 역할 선택 카드 */}
      <div className="flex flex-col gap-3">
        <RoleCard
          title="부원"
          badge="일반 회원"
          lines={['합주실 · 드럼 연습실 예약', '서비스를 이용합니다.']}
          onClick={() => navigate('/signup/member')}
        />
        <RoleCard
          title="회장단"
          badge="운영진"
          lines={['밴드 운영에 참여하는', '임원 역할입니다.']}
          onClick={() => navigate('/signup/officer')}
        />
      </div>

      <p className="text-zinc-700 text-xs text-center mt-auto pt-10">
        가입 전 밴드 소속 여부를 반드시 확인해주세요.
      </p>
    </div>
  )
}

function RoleCard({ title, badge, lines, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5
                 text-left active:bg-zinc-800 transition-colors
                 flex items-center justify-between gap-4"
    >
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white text-lg font-bold">{title}</span>
          <span className="text-zinc-500 text-[11px] bg-zinc-800 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        </div>
        {lines.map((line, i) => (
          <p key={i} className="text-zinc-500 text-sm leading-relaxed">{line}</p>
        ))}
      </div>
      <ChevronRight />
    </button>
  )
}

function ChevronRight() {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="#52525b" strokeWidth="2"
      className="shrink-0"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  )
}
