import { useNavigate } from 'react-router-dom'

export default function PendingApprovalPage() {
  const navigate = useNavigate()

  const handleNag = () => {
    window.open('https://open.kakao.com/o/sYYu5Dqi', '_blank')
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 safe-top safe-bottom text-center">
      {/* 시계 아이콘 */}
      <div className="mb-6">
        <ClockIcon />
      </div>

      {/* 상태 메시지 */}
      <h2 className="text-xl font-bold text-white mb-8">
        가입 승인 대기중입니다
      </h2>

      {/* 로고 */}
      <div className="mb-8">
        <p className="text-3xl font-bold text-white tracking-[0.25em] leading-tight">
          FEARLESS
        </p>
        <p className="text-3xl font-bold text-white tracking-[0.25em] leading-tight">
          DAWN
        </p>
      </div>

      {/* 안내 문구 */}
      <p className="text-zinc-500 text-sm leading-relaxed mb-12">
        개발자의 승인이 완료되면<br />서비스를 이용하실 수 있습니다.
      </p>

      {/* 버튼 영역 */}
      <div className="w-full flex flex-col gap-3">
        <button
          onClick={handleNag}
          className="w-full py-4 bg-white text-black rounded-2xl text-base font-semibold
                     active:bg-zinc-100 transition-colors"
        >
          개발자 재촉하기
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full py-3 text-zinc-600 text-sm active:text-zinc-400 transition-colors"
        >
          로그인 화면으로 돌아가기
        </button>
      </div>
    </div>
  )
}

function ClockIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      className="text-zinc-400"
    >
      <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="3" />
      <path
        d="M40 22v20l12 8"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="40" cy="40" r="2" fill="currentColor" />
    </svg>
  )
}
