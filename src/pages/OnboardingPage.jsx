import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FDLogo from '../components/FDLogo'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const saved = localStorage.getItem('userNickname')
    if (saved) setNickname(saved)

    // 페이드인 트리거
    requestAnimationFrame(() => setVisible(true))

    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    const timer = setTimeout(() => {
      navigate('/home', { replace: true })
    }, 1800)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div
      className={`min-h-screen bg-black flex flex-col items-center justify-center
                  transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="flex flex-col items-center gap-4">
        <FDLogo size={56} />

        <div className="text-center mt-1">
          <p className="text-white text-2xl font-bold tracking-[0.3em]">FEARLESS</p>
          <p className="text-white text-2xl font-bold tracking-[0.3em]">DAWN</p>
        </div>

        {nickname && (
          <p className="text-zinc-500 text-sm mt-3">
            안녕하세요,{' '}
            <span className="text-zinc-300 font-medium">{nickname}</span>님
          </p>
        )}
      </div>
    </div>
  )
}
