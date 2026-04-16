import { useState } from 'react'
import { supabase } from '../lib/supabase'
import FDLogo from '../components/FDLogo'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleKakaoLogin = async () => {
    setLoading(true)
    await supabase.auth.signOut() // 기존 세션 제거 → 카카오 로그인 화면 강제
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: 'https://fearlessdawn.store/oauth/callback',
        scopes: 'profile_nickname profile_image account_email',
      },
    })
    if (error) {
      alert('카카오 로그인 연결에 실패했습니다.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col px-7">

      {/* 브랜드 영역 — 화면 중앙을 차지 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5">
        <FDLogo size={52} />
        <div className="text-center">
          <h1 className="text-white text-[28px] font-bold tracking-[0.3em] leading-snug">
            FEARLESS
          </h1>
          <h1 className="text-white text-[28px] font-bold tracking-[0.3em] leading-snug">
            DAWN
          </h1>
        </div>
        <p className="text-zinc-600 text-xs tracking-widest mt-1">
          합주 · 드럼 예약 서비스
        </p>
      </div>

      {/* 하단 액션 영역 */}
      <div className="pb-14 flex flex-col gap-3">

        {/* 카카오 로그인 — 주요 CTA */}
        <button
          onClick={handleKakaoLogin}
          disabled={loading}
          className="w-full h-[54px] bg-[#FEE500] text-[#191919] rounded-2xl
                     text-[15px] font-bold tracking-wide
                     flex items-center justify-center gap-2.5
                     active:scale-[0.98] active:bg-[#e6cf00]
                     transition-all disabled:opacity-50"
        >
          <KakaoIcon />
          {loading ? '연결 중...' : '카카오로 시작하기'}
        </button>

        {/* 안내 */}
        <p className="text-zinc-700 text-xs text-center pt-1">
          신규 멤버도 카카오 로그인으로 가입할 수 있어요.
        </p>
      </div>
    </div>
  )
}

function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 2C5.582 2 2 4.925 2 8.5c0 2.26 1.416 4.247 3.572 5.42L4.75 17.1a.25.25 0 0 0 .372.27L9.13 14.96c.287.025.578.04.87.04 4.418 0 8-2.925 8-6.5S14.418 2 10 2Z"
        fill="#191919"
      />
    </svg>
  )
}
