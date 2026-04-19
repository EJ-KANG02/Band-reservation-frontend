import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateUserInfo } from '../api/auth'
import BackButton from '../components/BackButton'

export default function ProfileEditPage() {
  const navigate = useNavigate()
  const teamNameInit = localStorage.getItem('userTeamName') || ''
  const [form, setForm] = useState({
    nickname:  localStorage.getItem('userNickname')  || '',
    teamName:  teamNameInit,
    name:      localStorage.getItem('userName')      || '',
    studentId: localStorage.getItem('userStudentId') || '',
  })
  const [originalTeamName] = useState(teamNameInit)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
    setSuccess(false)
  }

  const handleSubmit = async () => {
    if (!form.nickname.trim()) {
      setError('닉네임을 입력해주세요.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await updateUserInfo({
        nickname:  form.nickname.trim(),
        name:      form.name.trim(),
        studentId: form.studentId.trim(),
        teamName:  form.teamName.trim(),
      })
      if (res.isSuccess && res.result) {
        const r = res.result
        localStorage.setItem('userNickname',  r.nickname  || form.nickname.trim())
        localStorage.setItem('userName',      r.name      || form.name.trim())
        localStorage.setItem('userStudentId', r.studentId || form.studentId.trim())
        localStorage.setItem('userTeamName',  r.teamName  || form.teamName.trim())
        setSuccess(true)
        setTimeout(() => navigate('/mypage'), 800)
      } else {
        setError(res.message || '수정에 실패했습니다.')
      }
    } catch (err) {
      setError(err.response?.data?.message || '서버 연결에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-black flex flex-col px-6 safe-top safe-bottom pb-8">
      <div className="pt-12 mb-6">
        <BackButton />
      </div>
      <h1 className="text-xl font-bold text-white mb-8">회원정보 수정</h1>

      <div className="flex flex-col gap-4 flex-1">
        {/* 닉네임 */}
        <FieldGroup label="닉네임">
          <div className="relative">
            <input
              type="text"
              value={form.nickname}
              onChange={(e) => handleChange('nickname', e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="w-full bg-zinc-900 text-white placeholder:text-zinc-600
                         px-4 py-3 pr-10 rounded-xl outline-none text-sm
                         border border-transparent focus:border-zinc-700 transition-colors"
            />
            {form.nickname.length > 0 && (
              <button
                onClick={() => handleChange('nickname', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 active:text-zinc-300"
              >
                <XIcon />
              </button>
            )}
          </div>
        </FieldGroup>

        {/* 팀명 */}
        <FieldGroup label="팀명 (선택)" hint="팀명이 있어야 합주 예약이 가능합니다.">
          <input
            type="text"
            value={form.teamName}
            onChange={(e) => handleChange('teamName', e.target.value)}
            placeholder="팀명을 입력하세요"
            className="w-full bg-zinc-900 text-white placeholder:text-zinc-600
                       px-4 py-3 rounded-xl outline-none text-sm
                       border border-transparent focus:border-zinc-700 transition-colors"
          />
          {form.teamName !== originalTeamName && (
            <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl px-3.5 py-3 mt-1">
              <p className="text-amber-400 text-xs leading-relaxed">
                팀원들과 <span className="font-bold">정확히 같은 철자</span>로 입력해야 합주 예약이 연동됩니다.
                허위 팀명 등록 시 팀명이 강제 삭제될 수 있습니다.
              </p>
            </div>
          )}
        </FieldGroup>

        {/* 이름 */}
        <FieldGroup label="이름">
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="이름을 입력하세요"
            className="w-full bg-zinc-900 text-white placeholder:text-zinc-600
                       px-4 py-3 rounded-xl outline-none text-sm
                       border border-transparent focus:border-zinc-700 transition-colors"
          />
        </FieldGroup>

        {/* 학번 */}
        <FieldGroup label="학번">
          <input
            type="text"
            inputMode="numeric"
            value={form.studentId}
            onChange={(e) => handleChange('studentId', e.target.value)}
            placeholder="학번을 입력하세요"
            className="w-full bg-zinc-900 text-white placeholder:text-zinc-600
                       px-4 py-3 rounded-xl outline-none text-sm
                       border border-transparent focus:border-zinc-700 transition-colors"
          />
        </FieldGroup>
      </div>

      {error && (
        <p className="text-red-400 text-sm text-center mb-4">{error}</p>
      )}
      {success && (
        <p className="text-emerald-400 text-sm text-center mb-4">수정이 완료되었습니다.</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-4 bg-white text-black rounded-2xl text-base font-bold
                   active:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
      >
        {loading ? '처리 중...' : '변경 완료'}
      </button>
    </div>
  )
}

function FieldGroup({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-zinc-400 text-xs font-medium pl-1">{label}</label>
      {children}
      {hint && <p className="text-zinc-600 text-xs pl-1">{hint}</p>}
    </div>
  )
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}
