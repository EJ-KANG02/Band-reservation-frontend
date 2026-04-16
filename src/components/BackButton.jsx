import { useNavigate } from 'react-router-dom'

export default function BackButton({ to }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (to) {
      navigate(to)
    } else {
      navigate(-1)
    }
  }

  return (
    <button
      onClick={handleBack}
      className="text-white p-1 -ml-1 active:text-zinc-400 transition-colors"
      aria-label="뒤로가기"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  )
}
