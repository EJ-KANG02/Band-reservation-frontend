import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signup, checkNickname } from '../api/auth'
import BackButton from '../components/BackButton'

export default function MemberSignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nickname: sessionStorage.getItem('kakaoNickname') || '',
    name: '',
    studentId: '',
    teamName: '',
  })
  const [agreed1, setAgreed1] = useState(false)
  const [agreed2, setAgreed2] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // 닉네임 중복확인 상태: idle | checking | ok | taken | error
  const [nicknameCheck, setNicknameCheck] = useState('idle')
  const [nicknameCheckMsg, setNicknameCheckMsg] = useState('')

  useEffect(() => {
    if (!sessionStorage.getItem('kakaoId')) {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: false }))
    setSubmitError('')
    if (field === 'nickname') {
      setNicknameCheck('idle')
      setNicknameCheckMsg('')
    }
  }

  const handleCheckNickname = async () => {
    const trimmed = form.nickname.trim()
    if (!trimmed) {
      setErrors(prev => ({ ...prev, nickname: true }))
      return
    }
    setNicknameCheck('checking')
    setNicknameCheckMsg('')
    try {
      const res = await checkNickname(trimmed)
      // result: true → 사용 가능 / result: false → 중복
      if (res.result === true) {
        setNicknameCheck('ok')
        setNicknameCheckMsg('사용 가능한 닉네임입니다.')
      } else {
        setNicknameCheck('taken')
        setNicknameCheckMsg('이미 사용 중인 닉네임입니다.')
      }
    } catch (err) {
      setNicknameCheck('error')
      setNicknameCheckMsg('중복 확인 중 오류가 발생했습니다.')
    }
  }

  const validate = () => {
    const next = {
      nickname: !form.nickname.trim(),
      name: !form.name.trim(),
      studentId: !form.studentId.trim(),
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return false
    if (nicknameCheck !== 'ok') {
      setSubmitError('닉네임 중복확인을 완료해주세요.')
      return false
    }
    if (!agreed1 || !agreed2) {
      setSubmitError('필수 항목에 모두 동의해주세요.')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validate()) return
    const kakaoId = sessionStorage.getItem('kakaoId')
    setLoading(true)
    setSubmitError('')
    try {
      const res = await signup({
        kakaoId,
        name: form.name.trim(),
        nickname: form.nickname.trim(),
        studentId: form.studentId.trim(),
        teamName: form.teamName.trim(),
        role: 'MEMBER',
      })
      localStorage.setItem('accessToken', res.result.accessToken)
      localStorage.setItem('userNickname', form.nickname.trim())
      localStorage.setItem('userTeamName', form.teamName.trim())
      localStorage.setItem('userName', form.name.trim())
      localStorage.setItem('userStudentId', form.studentId.trim())
      sessionStorage.removeItem('kakaoId')
      sessionStorage.removeItem('kakaoNickname')
      navigate('/onboarding', { replace: true })
    } catch (err) {
      setSubmitError(err.response?.data?.message || '가입 처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col px-6">
      <div className="pt-12 mb-8">
        <BackButton />
      </div>

      <h1 className="text-white text-2xl font-bold mb-1">부원 가입</h1>
      <p className="text-zinc-500 text-sm mb-8">추가 정보를 입력해주세요.</p>

      <div className="flex flex-col gap-5 flex-1">

        {/* 닉네임 + 중복확인 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-zinc-400 text-xs font-medium">닉네임</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="활동명을 입력하세요"
              value={form.nickname}
              onChange={e => handleChange('nickname', e.target.value)}
              className={`flex-1 bg-zinc-900 text-white placeholder:text-zinc-600
                          px-4 py-3.5 rounded-xl outline-none text-sm
                          border transition-colors
                          ${errors.nickname
                            ? 'border-red-500/60'
                            : nicknameCheck === 'ok'
                              ? 'border-emerald-500/50'
                              : 'border-transparent focus:border-zinc-600'
                          }`}
            />
            <button
              type="button"
              onClick={handleCheckNickname}
              disabled={nicknameCheck === 'checking' || !form.nickname.trim()}
              className="shrink-0 px-4 py-3.5 bg-zinc-800 text-zinc-300 text-xs font-medium
                         rounded-xl border border-zinc-700 transition-colors
                         active:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed
                         whitespace-nowrap"
            >
              {nicknameCheck === 'checking' ? '확인 중...' : '중복확인'}
            </button>
          </div>
          {errors.nickname && (
            <p className="text-red-400 text-xs pl-1">필수 입력 항목입니다.</p>
          )}
          {!errors.nickname && nicknameCheck === 'ok' && (
            <p className="text-emerald-400 text-xs pl-1">{nicknameCheckMsg}</p>
          )}
          {!errors.nickname && nicknameCheck === 'taken' && (
            <p className="text-red-400 text-xs pl-1">{nicknameCheckMsg}</p>
          )}
          {!errors.nickname && nicknameCheck === 'error' && (
            <p className="text-amber-400 text-xs pl-1">{nicknameCheckMsg}</p>
          )}
          {!errors.nickname && nicknameCheck === 'idle' && (
            <p className="text-zinc-600 text-xs pl-1">닉네임은 예약 화면에 표시됩니다.</p>
          )}
        </div>

        <Field
          label="이름"
          placeholder="실명을 입력하세요"
          value={form.name}
          onChange={v => handleChange('name', v)}
          error={errors.name}
        />
        <Field
          label="학번"
          placeholder="학번을 입력하세요"
          value={form.studentId}
          onChange={v => handleChange('studentId', v)}
          error={errors.studentId}
          inputMode="numeric"
        />
        <Field
          label="팀명 (선택)"
          placeholder="소속 팀이 없으면 비워두세요"
          value={form.teamName}
          onChange={v => handleChange('teamName', v)}
          hint="팀명이 있어야 합주 예약이 가능합니다. 팀원들과 철자를 동일하게 입력해주세요."
        />

        {/* 동의 항목 */}
        <div className="flex flex-col gap-4 mt-2 pb-4 border-t border-zinc-900 pt-5">
          <Checkbox
            checked={agreed1}
            onChange={setAgreed1}
            label="피어리스던의 부원입니다."
          />
          <Checkbox
            checked={agreed2}
            onChange={setAgreed2}
            label="이용약관 및 개인정보 정책에 동의합니다."
          />
        </div>
      </div>

      {submitError && (
        <p className="text-red-400 text-sm text-center mb-3">{submitError}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full h-[54px] bg-white text-black rounded-2xl text-[15px] font-bold
                   mb-10 active:bg-zinc-100 transition-colors
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? '처리 중...' : '가입 완료'}
      </button>
    </div>
  )
}

function Field({ label, hint, error, onChange, ...inputProps }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-zinc-400 text-xs font-medium">{label}</label>
      <input
        type="text"
        onChange={e => onChange(e.target.value)}
        className={`w-full bg-zinc-900 text-white placeholder:text-zinc-600
                    px-4 py-3.5 rounded-xl outline-none text-sm
                    border transition-colors
                    ${error
                      ? 'border-red-500/60'
                      : 'border-transparent focus:border-zinc-600'
                    }`}
        {...inputProps}
      />
      {error && <p className="text-red-400 text-xs pl-1">필수 입력 항목입니다.</p>}
      {hint && !error && <p className="text-zinc-600 text-xs pl-1">{hint}</p>}
    </div>
  )
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label
      className="flex items-start gap-3 cursor-pointer"
      onClick={() => onChange(!checked)}
    >
      <div
        className={`mt-0.5 w-5 h-5 rounded-md border-2 shrink-0
                    flex items-center justify-center transition-colors
                    ${checked ? 'bg-white border-white' : 'border-zinc-700'}`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4l3 3 5-5"
              stroke="#000"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <span className="text-zinc-400 text-sm leading-relaxed">
        <span className="text-zinc-300 font-medium">[필수]</span> {label}
      </span>
    </label>
  )
}
