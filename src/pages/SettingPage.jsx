import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateSetting } from '../api/auth'
import BackButton from '../components/BackButton'

const DEFAULTS = {
  ensembleMaxCountPerWeek: 3,
  ensembleMaxTime: 3,
  drumMaxCountPerWeek: 3,
  drumMaxTime: 3,
}

function loadSettings() {
  try {
    const raw = localStorage.getItem('appSettings')
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
  } catch {
    return { ...DEFAULTS }
  }
}

export default function SettingPage() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState(loadSettings)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const startEdit = () => {
    setDraft({ ...settings })
    setError('')
    setEditing(true)
  }

  const cancelEdit = () => {
    setDraft(null)
    setError('')
    setEditing(false)
  }

  const change = (key, delta) => {
    setDraft(prev => ({
      ...prev,
      [key]: Math.min(10, Math.max(1, prev[key] + delta)),
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await updateSetting({
        ensembleMaxCountPerWeek: draft.ensembleMaxCountPerWeek,
        ensembleMaxTime:         draft.ensembleMaxTime,
        drumMaxCountPerWeek:     draft.drumMaxCountPerWeek,
        drumMaxTime:             draft.drumMaxTime,
      })
      localStorage.setItem('appSettings', JSON.stringify(draft))
      setSettings({ ...draft })
      setEditing(false)
      setDraft(null)
    } catch (err) {
      setError(err.response?.data?.message || '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const cur = editing ? draft : settings

  return (
    <div className="min-h-screen bg-black flex flex-col px-6 safe-top safe-bottom pb-8">
      <div className="pt-12 mb-6">
        <BackButton />
      </div>
      <h1 className="text-xl font-bold text-white mb-8">예약 설정</h1>

      <div className="flex flex-col gap-7">
        {/* 합주 설정 */}
        <SettingSection title="합주 설정">
          <SettingRow
            label="예약 횟수"
            unit="회"
            prefix="주당"
            value={cur.ensembleMaxCountPerWeek}
            editing={editing}
            onMinus={() => change('ensembleMaxCountPerWeek', -1)}
            onPlus={() => change('ensembleMaxCountPerWeek', +1)}
          />
          <SettingRow
            label="예약 시간"
            unit="시간"
            prefix="하루"
            value={cur.ensembleMaxTime}
            editing={editing}
            onMinus={() => change('ensembleMaxTime', -1)}
            onPlus={() => change('ensembleMaxTime', +1)}
          />
        </SettingSection>

        {/* 드럼 연습 설정 */}
        <SettingSection title="드럼 연습 설정">
          <SettingRow
            label="예약 횟수"
            unit="회"
            prefix="주당"
            value={cur.drumMaxCountPerWeek}
            editing={editing}
            onMinus={() => change('drumMaxCountPerWeek', -1)}
            onPlus={() => change('drumMaxCountPerWeek', +1)}
          />
          <SettingRow
            label="예약 시간"
            unit="시간"
            prefix="하루"
            value={cur.drumMaxTime}
            editing={editing}
            onMinus={() => change('drumMaxTime', -1)}
            onPlus={() => change('drumMaxTime', +1)}
          />
        </SettingSection>
      </div>

      {error && (
        <p className="text-red-400 text-sm text-center mt-6">{error}</p>
      )}

      {/* 하단 버튼 */}
      {editing ? (
        <div className="flex gap-3 mt-10">
          <button
            onClick={cancelEdit}
            disabled={saving}
            className="flex-1 py-4 bg-zinc-900 text-zinc-300 rounded-2xl text-sm font-medium
                       border border-zinc-800 active:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-4 bg-white text-black rounded-2xl text-sm font-bold
                       active:bg-zinc-100 transition-colors disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      ) : (
        <button
          onClick={startEdit}
          className="mt-10 w-full py-4 bg-zinc-900 text-white rounded-2xl text-sm font-medium
                     border border-zinc-800 active:bg-zinc-800 transition-colors"
        >
          수정
        </button>
      )}
    </div>
  )
}

function SettingSection({ title, children }) {
  return (
    <div className="bg-zinc-900 rounded-2xl px-5 py-4">
      <h2 className="text-white text-sm font-semibold mb-4">{title}</h2>
      <div className="flex flex-col gap-4">
        {children}
      </div>
    </div>
  )
}

function SettingRow({ label, unit, prefix, value, editing, onMinus, onPlus }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-400 text-sm">{label}</span>
      {editing ? (
        <div className="flex items-center gap-3">
          <button
            onClick={onMinus}
            className="w-8 h-8 rounded-full bg-zinc-800 text-white text-lg flex items-center justify-center
                       active:bg-zinc-700 transition-colors"
          >
            −
          </button>
          <span className="text-zinc-400 text-xs w-8 text-center">{prefix}</span>
          <span className="text-white text-2xl font-bold w-6 text-center">{value}</span>
          <span className="text-zinc-400 text-xs">{unit}</span>
          <button
            onClick={onPlus}
            className="w-8 h-8 rounded-full bg-zinc-800 text-white text-lg flex items-center justify-center
                       active:bg-zinc-700 transition-colors"
          >
            +
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500 text-xs">{prefix}</span>
          <span className="text-white text-2xl font-bold">{value}</span>
          <span className="text-zinc-500 text-xs">{unit}</span>
        </div>
      )}
    </div>
  )
}
