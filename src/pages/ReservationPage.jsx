import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { checkAvailability, createReservations, updateReservation } from '../api/auth'
import BackButton from '../components/BackButton'

// ─── 슬롯 상수 ──────────────────────────────────────────
const SLOT_START  = 9    // 09:00
const SLOT_END    = 23   // 23:00
const SLOT_HEIGHT = 32   // px
const TOTAL_SLOTS = (SLOT_END - SLOT_START) * 2  // 28개 (30분 단위)

// ─── 시간 유틸 ──────────────────────────────────────────
function slotToTime(idx) {
  const min = SLOT_START * 60 + idx * 30
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
}
function timeToSlotFloat(str) {
  const [h, m] = str.split(':').map(Number)
  return (h * 60 + m - SLOT_START * 60) / 30
}
function slotToLabel(idx) {
  const min = SLOT_START * 60 + idx * 30
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
}
function minutesToLabel(min) {
  const h = Math.floor(min / 60), m = min % 60
  if (h === 0) return `${m}분`
  if (m === 0) return `${h}시간`
  return `${h}시간 ${m}분`
}

// 연속 슬롯 → 범위 배열
function slotsToRanges(slots) {
  if (!slots.size) return []
  const sorted = [...slots].sort((a, b) => a - b)
  const ranges = []
  let s = sorted[0], p = sorted[0]
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === p + 1) { p = sorted[i] }
    else { ranges.push([s, p]); s = sorted[i]; p = sorted[i] }
  }
  ranges.push([s, p])
  return ranges
}

// ─── 날짜 유틸 ──────────────────────────────────────────
function toDateStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r }

const MONTH_NAMES  = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
// 일요일 시작 (Korean standard)
const CAL_HEADERS  = ['일', '월', '화', '수', '목', '금', '토']

// ═══════════════════════════════════════════════════════
const SETTING_DEFAULTS = { ensembleMaxCountPerWeek: 3, ensembleMaxTime: 3, drumMaxCountPerWeek: 3, drumMaxTime: 3 }
function loadSettings() {
  try {
    const raw = localStorage.getItem('appSettings')
    return raw ? { ...SETTING_DEFAULTS, ...JSON.parse(raw) } : { ...SETTING_DEFAULTS }
  } catch { return { ...SETTING_DEFAULTS } }
}

export default function ReservationPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const today     = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d }, [])
  const appSettings = useMemo(() => loadSettings(), [])

  // ── 수정 모드
  const editReservation = location.state?.reservation ?? null  // { reservationId, date, startTime, endTime, category }
  const isEditMode      = !!location.state?.editMode

  const teamName = localStorage.getItem('userTeamName') || ''

  const [category,      setCategory]      = useState(isEditMode ? editReservation.category : null)
  const [selectedDate,  setSelectedDate]  = useState(() => {
    if (isEditMode && editReservation?.date) {
      const [y, m, d] = editReservation.date.split('-').map(Number)
      return new Date(y, m - 1, d)
    }
    return null
  })
  const [blockedSlots,  setBlockedSlots]  = useState(new Set())
  const [selectedSlots, setSelectedSlots] = useState(() => {
    if (isEditMode && editReservation?.startTime && editReservation?.endTime) {
      const s = Math.floor(timeToSlotFloat(editReservation.startTime))
      const e = Math.ceil(timeToSlotFloat(editReservation.endTime)) - 1
      const slots = new Set()
      for (let i = s; i <= e; i++) slots.add(i)
      return slots
    }
    return new Set()
  })
  const [availLoading,  setAvailLoading]  = useState(false)
  const [submitting,    setSubmitting]    = useState(false)
  const [error,         setError]         = useState('')

  // 합주 예약은 팀명 필요
  const noTeamForEnsemble = category === 'ENSEMBLE' && !teamName

  // ── 드래그 상태
  const [isDragging,  setIsDragging]  = useState(false)
  const [dragCurrent, setDragCurrent] = useState(-1)
  const isDraggingRef  = useRef(false)
  const dragStartRef   = useRef(-1)
  const dragCurrentRef = useRef(-1)
  const dragModeRef    = useRef('select')
  const gridRef        = useRef(null)

  // ── 날짜 변경 시 blocked 슬롯 재조회
  useEffect(() => {
    if (!selectedDate) return
    setBlockedSlots(new Set())
    setSelectedSlots(new Set())
    setError('')
    setAvailLoading(true)
    checkAvailability(toDateStr(selectedDate))
      .then(res => {
        if (!res.isSuccess) return
        const blocked = new Set()
        ;(res.result || []).forEach(({ startTime, endTime }) => {
          const s = Math.floor(timeToSlotFloat(startTime))
          const e = Math.ceil(timeToSlotFloat(endTime)) - 1
          for (let i = Math.max(0, s); i <= Math.min(TOTAL_SLOTS - 1, e); i++) blocked.add(i)
        })
        setBlockedSlots(blocked)
      })
      .catch(() => {})
      .finally(() => setAvailLoading(false))
  }, [selectedDate])

  // ── 터치 (non-passive) 리스너 — selectedDate가 생긴 후 TimeGrid가 마운트되므로 의존성 추가
  useEffect(() => {
    if (!selectedDate) return
    const grid = gridRef.current
    if (!grid) return

    const onTouchStart = (e) => {
      e.preventDefault()
      const touch = e.touches[0]
      const el    = document.elementFromPoint(touch.clientX, touch.clientY)
      const slot  = el?.closest('[data-slot-idx]')
      if (slot) startDragRef.current(Number(slot.dataset.slotIdx))
    }

    const onTouchMove = (e) => {
      e.preventDefault()
      if (!isDraggingRef.current) return
      const touch = e.touches[0]
      const el    = document.elementFromPoint(touch.clientX, touch.clientY)
      const slot  = el?.closest('[data-slot-idx]')
      if (slot) {
        const idx = Number(slot.dataset.slotIdx)
        dragCurrentRef.current = idx
        setDragCurrent(idx)
      }
    }

    grid.addEventListener('touchstart', onTouchStart, { passive: false })
    grid.addEventListener('touchmove',  onTouchMove,  { passive: false })
    return () => {
      grid.removeEventListener('touchstart', onTouchStart)
      grid.removeEventListener('touchmove',  onTouchMove)
    }
  }, [selectedDate])

  // ── 드래그 중 미리보기 슬롯 계산
  const displaySlots = useMemo(() => {
    if (!isDragging || dragStartRef.current === -1 || dragCurrent === -1) return selectedSlots
    const lo = Math.min(dragStartRef.current, dragCurrent)
    const hi = Math.max(dragStartRef.current, dragCurrent)
    const next = new Set(selectedSlots)
    for (let i = lo; i <= hi; i++) {
      if (blockedSlots.has(i)) continue
      if (dragModeRef.current === 'select') next.add(i)
      else next.delete(i)
    }
    return next
  }, [isDragging, dragCurrent, selectedSlots, blockedSlots])

  const startDrag = (idx) => {
    if (blockedSlots.has(idx)) return
    dragStartRef.current   = idx
    dragCurrentRef.current = idx
    dragModeRef.current    = selectedSlots.has(idx) ? 'deselect' : 'select'
    isDraggingRef.current  = true
    setIsDragging(true)
    setDragCurrent(idx)
  }
  // startDrag를 ref로 유지 — 터치 리스너 클로저 stale 방지
  const startDragRef = useRef(null)
  startDragRef.current = startDrag
  const updateDrag = (idx) => {
    if (!isDraggingRef.current) return
    dragCurrentRef.current = idx
    setDragCurrent(idx)
  }
  const endDrag = () => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    const start   = dragStartRef.current
    const current = dragCurrentRef.current
    setSelectedSlots(prev => {
      if (start === -1 || current === -1) return prev
      const lo   = Math.min(start, current)
      const hi   = Math.max(start, current)
      const next = new Set(prev)
      for (let i = lo; i <= hi; i++) {
        if (blockedSlots.has(i)) continue
        if (dragModeRef.current === 'select') next.add(i)
        else next.delete(i)
      }
      return next
    })
    setIsDragging(false)
    setDragCurrent(-1)
    dragStartRef.current   = -1
    dragCurrentRef.current = -1
  }

  // ── 선택 요약
  const ranges  = slotsToRanges(displaySlots)
  const totalMin = displaySlots.size * 30
  const summaryText = ranges.length === 0
    ? null
    : ranges.map(([s, e]) => `${slotToLabel(s)} ~ ${slotToLabel(e + 1)}`).join(', ')
      + `  ·  ${minutesToLabel(totalMin)}`

  // ── 제출
  const canSubmit = category && selectedDate && displaySlots.size > 0 && !submitting && !noTeamForEnsemble
  const handleSubmit = async () => {
    if (!canSubmit) return
    setError('')
    setSubmitting(true)
    try {
      if (isEditMode) {
        // 수정: 첫 번째 연속 범위만 PATCH
        const [s, e] = ranges[0]
        try {
          await updateReservation(editReservation.reservationId, {
            date:      toDateStr(selectedDate),
            startTime: slotToTime(s),
            endTime:   slotToTime(e + 1),
            category,
          })
          navigate('/mypage/reservations')
        } catch (err) {
          setError(err.response?.data?.message || '수정에 실패했습니다.')
        }
        return
      } else {
        const reservationList = ranges.map(([s, e]) => ({
          date:      toDateStr(selectedDate),
          startTime: slotToTime(s),
          endTime:   slotToTime(e + 1),
          category,
        }))
        await createReservations(reservationList)
        navigate('/schedule')
      }
    } catch (err) {
      setError(err.response?.data?.message || (isEditMode ? '수정에 실패했습니다.' : '예약에 실패했습니다.'))
    } finally {
      setSubmitting(false)
    }
  }

  const accentColor = category === 'DRUM' ? 'orange' : 'blue'

  return (
    <div className="min-h-screen bg-black flex flex-col">

      {/* ── 헤더 */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4">
        <BackButton />
        <h1 className="text-white text-lg font-bold">{isEditMode ? '예약 수정' : '나의 예약'}</h1>
      </div>

      {/* ── 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto pb-28 px-5">

        {/* ── 예약 종류 */}
        <Section title="예약 종류">
          <div className="flex gap-3">
            <CategoryButton
              label="합주"
              value="ENSEMBLE"
              selected={category === 'ENSEMBLE'}
              color="blue"
              onClick={() => { if (!isEditMode) { setCategory('ENSEMBLE'); setSelectedSlots(new Set()) } }}
              disabled={isEditMode}
            />
            <CategoryButton
              label="드럼 연습"
              value="DRUM"
              selected={category === 'DRUM'}
              color="orange"
              onClick={() => { if (!isEditMode) { setCategory('DRUM'); setSelectedSlots(new Set()) } }}
              disabled={isEditMode}
            />
          </div>
          {noTeamForEnsemble && (
            <p className="text-amber-500/80 text-xs mt-2.5 leading-relaxed">
              합주 예약은 팀명 등록 후 가능합니다.{' '}
              <button
                className="underline text-amber-400"
                onClick={() => navigate('/mypage/edit')}
              >
                프로필에서 팀명 등록하기
              </button>
            </p>
          )}
        </Section>

        {/* ── 날짜 선택 */}
        <Section title="날짜 선택">
          <InlineCalendar
            today={today}
            selectedDate={selectedDate}
            accentColor={accentColor}
            onSelect={(d) => setSelectedDate(d)}
            initYear={selectedDate?.getFullYear()}
            initMonth={selectedDate?.getMonth()}
          />
        </Section>

        {/* ── 시간 선택 (날짜 선택 후 표시) */}
        {selectedDate && (
          <Section
            title="시간 선택"
            subtitle={summaryText
              ? <span className={`text-xs ${accentColor === 'blue' ? 'text-blue-400' : 'text-orange-400'}`}>
                  {summaryText}
                </span>
              : <span className="text-zinc-600 text-xs">시간대를 드래그해서 선택하세요</span>
            }
          >
            {availLoading ? (
              <div className="flex items-center justify-center py-10">
                <svg className="animate-spin" width="24" height="24" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="16" stroke="#27272a" strokeWidth="4" />
                  <path d="M20 4a16 16 0 0 1 16 16" stroke="white" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
            ) : (
              <TimeGrid
                containerRef={gridRef}
                displaySlots={displaySlots}
                blockedSlots={blockedSlots}
                accentColor={accentColor}
                onSlotMouseDown={startDrag}
                onSlotMouseEnter={updateDrag}
                onMouseUp={endDrag}
                onTouchEnd={endDrag}
              />
            )}

            {/* 범례 */}
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-sm ${accentColor === 'blue' ? 'bg-blue-500' : 'bg-orange-400'}`} />
                <span className="text-zinc-500 text-xs">선택</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-zinc-800 flex items-center justify-center">
                  <span className="text-zinc-600 text-[7px]">✕</span>
                </span>
                <span className="text-zinc-500 text-xs">예약됨</span>
              </div>
            </div>

            {/* 제약 안내 */}
            <p className="text-zinc-700 text-xs mt-2">
              {category === 'DRUM'
                ? `주당 최대 ${appSettings.drumMaxCountPerWeek}회 · 하루 최대 ${appSettings.drumMaxTime}시간`
                : `주당 최대 ${appSettings.ensembleMaxCountPerWeek}회 · 하루 최대 ${appSettings.ensembleMaxTime}시간`
              }
            </p>
          </Section>
        )}

        {/* ── 오류 */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mt-2">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* ── 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px]
                      bg-black/90 backdrop-blur-sm border-t border-zinc-900 px-5 py-4 flex gap-3">
        <button
          onClick={() => navigate(isEditMode ? '/mypage/reservations' : '/schedule')}
          className="flex-1 h-[50px] bg-zinc-900 text-zinc-300 rounded-2xl text-sm font-medium
                     border border-zinc-800 active:bg-zinc-800 transition-colors"
        >
          {isEditMode ? '취소' : '예약 현황'}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`flex-1 h-[50px] rounded-2xl text-sm font-bold transition-all
            ${canSubmit
              ? accentColor === 'blue'
                ? 'bg-blue-500 text-white active:bg-blue-600'
                : 'bg-orange-400 text-white active:bg-orange-500'
              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
        >
          {submitting ? '처리 중...' : isEditMode ? '수정 완료' : '예약하기'}
        </button>
      </div>
    </div>
  )
}

// ─── 섹션 래퍼 ──────────────────────────────────────────
function Section({ title, subtitle, children }) {
  return (
    <div className="mb-7">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-white text-sm font-semibold">{title}</h2>
        {subtitle && <span>{subtitle}</span>}
      </div>
      {children}
    </div>
  )
}

// ─── 카테고리 버튼 ───────────────────────────────────────
function CategoryButton({ label, selected, color, onClick, disabled }) {
  const ring = selected
    ? color === 'blue' ? 'border-blue-500 bg-blue-500/10' : 'border-orange-400 bg-orange-400/10'
    : 'border-zinc-800 bg-zinc-900'
  const dot = selected
    ? color === 'blue' ? 'bg-blue-500' : 'bg-orange-400'
    : 'border-2 border-zinc-700'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border flex-1
                  transition-all ${disabled ? 'opacity-60 cursor-default' : 'active:scale-[0.98]'} ${ring}`}
    >
      <span className={`w-4 h-4 rounded-full shrink-0 transition-colors ${dot}`} />
      <span className={`text-sm font-medium ${selected ? 'text-white' : 'text-zinc-400'}`}>
        {label}
      </span>
    </button>
  )
}

// ─── 달력 ────────────────────────────────────────────────
function InlineCalendar({ today, selectedDate, accentColor, onSelect, initYear, initMonth }) {
  const [viewYear,  setViewYear]  = useState(initYear  ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(initMonth ?? today.getMonth())

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  // 셀 생성 (일요일 시작)
  const firstDay   = new Date(viewYear, viewMonth, 1)
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const startOffset = firstDay.getDay() // 0=Sun

  const cells = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7))

  const isPast     = (d) => d && d < today
  const isToday    = (d) => d && isSameDay(d, today)
  const isSelected = (d) => d && selectedDate && isSameDay(d, selectedDate)

  const selBg = accentColor === 'orange' ? 'bg-orange-400 text-white' : 'bg-blue-500 text-white'

  return (
    <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-900">
      {/* 월 내비게이션 */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1.5 text-zinc-500 active:text-white transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="text-white text-sm font-semibold tracking-wider">
          {String(viewMonth + 1).padStart(2, '0')}
          <span className="text-zinc-500 text-xs ml-1.5">{viewYear}</span>
        </span>
        <button onClick={nextMonth} className="p-1.5 text-zinc-500 active:text-white transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {CAL_HEADERS.map((d, i) => (
          <div key={i} className={`text-center text-[11px] py-1
            ${i === 0 ? 'text-red-500/60' : i === 6 ? 'text-blue-500/60' : 'text-zinc-600'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((d, di) => {
            if (!d) return <div key={di} className="h-9" />
            const past     = isPast(d)
            const todayDay = isToday(d)
            const selected = isSelected(d)
            return (
              <button
                key={di}
                disabled={past}
                onClick={() => !past && onSelect(new Date(d))}
                className={`h-9 flex items-center justify-center rounded-full mx-auto w-8
                  text-xs font-medium transition-colors relative
                  ${selected
                    ? selBg
                    : past
                      ? 'text-zinc-800 cursor-not-allowed'
                      : di === 0
                        ? 'text-red-400 active:bg-zinc-800'
                        : di === 6
                          ? 'text-blue-400 active:bg-zinc-800'
                          : 'text-zinc-300 active:bg-zinc-800'
                  }`}
              >
                {d.getDate()}
                {/* 오늘 점 */}
                {todayDay && !selected && (
                  <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full
                    ${accentColor === 'orange' ? 'bg-orange-400' : 'bg-blue-500'}`}
                  />
                )}
              </button>
            )
          })}
        </div>
      ))}

      {/* 범례 */}
      <div className="flex gap-4 mt-3 justify-center">
        <div className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full border border-zinc-600`} />
          <span className="text-zinc-600 text-[10px]">오늘</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full
            ${accentColor === 'orange' ? 'bg-orange-400' : 'bg-blue-500'}`} />
          <span className="text-zinc-600 text-[10px]">선택</span>
        </div>
      </div>
    </div>
  )
}

// ─── 시간 그리드 ─────────────────────────────────────────
const TimeGrid = ({
  containerRef,
  displaySlots,
  blockedSlots,
  accentColor,
  onSlotMouseDown,
  onSlotMouseEnter,
  onMouseUp,
  onTouchEnd,
}) => {
  return (
    <div
      ref={containerRef}
      className="rounded-2xl overflow-hidden border border-zinc-900 select-none touch-none"
      onMouseUp={onMouseUp}
      onTouchEnd={onTouchEnd}
      onMouseLeave={onMouseUp}
    >
      {Array.from({ length: TOTAL_SLOTS }, (_, idx) => {
        const isHour     = idx % 2 === 0
        const isBlocked  = blockedSlots.has(idx)
        const isSelected = displaySlots.has(idx)
        const label      = isHour ? slotToLabel(idx) : ''

        const slotColor = isSelected
          ? accentColor === 'blue' ? 'bg-blue-500' : 'bg-orange-400'
          : isBlocked
            ? 'bg-zinc-900/80 cursor-not-allowed'
            : 'bg-zinc-900/40 cursor-pointer'

        const borderClass = isHour
          ? 'border-t border-zinc-800'
          : 'border-t border-zinc-900'

        return (
          <div
            key={idx}
            data-slot-idx={idx}
            style={{ height: SLOT_HEIGHT }}
            className={`flex items-center ${borderClass} ${slotColor} transition-colors`}
            onMouseDown={() => onSlotMouseDown(idx)}
            onMouseEnter={() => onSlotMouseEnter(idx)}
          >
            {/* 시간 레이블 */}
            <span className="w-12 text-right pr-2.5 shrink-0 text-zinc-700 text-[10px]">
              {label}
            </span>

            {/* 슬롯 바 */}
            <div className={`flex-1 h-full flex items-center justify-center
              ${isSelected
                ? accentColor === 'blue' ? 'bg-blue-500' : 'bg-orange-400'
                : isBlocked ? 'bg-zinc-800/60' : ''
              }`}
            >
              {isBlocked && (
                <span className="text-zinc-600 text-[10px] font-bold">✕</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
