import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { login, getUserInfo } from '../api/auth'

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    let handled = false

    const processSession = async (session) => {
      if (handled) return
      handled = true

      const kakaoId = session.user.identities?.[0]?.id
      const nickname =
        session.user.user_metadata?.name ||
        session.user.user_metadata?.full_name ||
        '사용자'

      try {
        const res = await login(String(kakaoId))
        localStorage.setItem('accessToken', res.result.accessToken)

        // 프로필 정보 복원 (GET /api/v0/user/info)
        try {
          const info = await getUserInfo()
          if (info.isSuccess && info.result) {
            localStorage.setItem('userNickname',  info.result.nickname  || '')
            localStorage.setItem('userTeamName',  info.result.teamName  || '')
            localStorage.setItem('userName',      info.result.name      || '')
            localStorage.setItem('userStudentId', info.result.studentId || '')
          }
        } catch (_) {
          // 프로필 조회 실패 시 기존 캐시 유지
        }

        navigate('/onboarding', { replace: true })
      } catch (err) {
        const status  = err.response?.status
        const message = err.response?.data?.message ?? ''

        if (status === 404) {
          // 신규 유저 → 회원가입
          sessionStorage.setItem('kakaoId', String(kakaoId))
          sessionStorage.setItem('kakaoNickname', nickname)
          navigate('/signup', { replace: true })
        } else if (message.includes('승인')) {
          // 미승인 회장단 → 대기 화면
          navigate('/pending', { replace: true })
        } else {
          setError(message || '로그인 처리 중 오류가 발생했습니다.')
        }
      }
    }

    // PKCE 코드 교환 완료 대기 (onAuthStateChange만 사용 — 중복 교환 방지)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
          processSession(session)
        }
      }
    )

    // 3. 10초 타임아웃: 세션이 끝내 없으면 /login으로
    const timeout = setTimeout(() => {
      if (!handled) {
        navigate('/login', { replace: true })
      }
    }, 10_000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
        <p className="text-red-400 text-sm text-center mb-6">{error}</p>
        <button
          onClick={() => navigate('/login', { replace: true })}
          className="px-6 py-3 bg-zinc-900 text-zinc-300 text-sm rounded-2xl
                     border border-zinc-800 active:bg-zinc-800 transition-colors"
        >
          로그인으로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Spinner />
    </div>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="16" stroke="#27272a" strokeWidth="4" />
      <path
        d="M20 4a16 16 0 0 1 16 16"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}
