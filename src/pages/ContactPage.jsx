import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'

const KAKAO_OPEN_CHAT_URL = 'https://open.kakao.com/o/sYYu5Dqi'

export default function ContactPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black flex flex-col px-6 safe-top safe-bottom pb-8">
      <div className="pt-12 mb-6">
        <BackButton />
      </div>
      <h1 className="text-xl font-bold text-white mb-0">문의하기</h1>

      {/* 중앙 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 -mt-12">
        {/* 아이콘 */}
        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>

        {/* 안내 문구 */}
        <p className="text-white text-sm text-center leading-relaxed">
          <span className="font-bold">'피어리스던 합주 예약'</span> 서비스 관련<br />
          문의사항은 아래 오픈채팅방으로<br />
          연락주시길 바랍니다!
        </p>

        {/* 카카오톡 버튼 */}
        <button
          onClick={() => KAKAO_OPEN_CHAT_URL && window.open(KAKAO_OPEN_CHAT_URL, '_blank')}
          disabled={!KAKAO_OPEN_CHAT_URL}
          className="flex items-center gap-2 bg-white text-black px-6 py-3.5 rounded-2xl
                     text-sm font-bold active:bg-zinc-100 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          카카오톡 오픈채팅 바로가기
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </button>

        {/* 운영 시간 */}
        <p className="text-zinc-600 text-xs text-center leading-relaxed">
          운영시간: 상시 운영
        </p>
      </div>

      {/* 푸터 */}
      <div className="text-center">
        <p className="text-zinc-700 text-xs tracking-[0.2em] font-medium">FEARLESS DAWN</p>
      </div>
    </div>
  )
}
