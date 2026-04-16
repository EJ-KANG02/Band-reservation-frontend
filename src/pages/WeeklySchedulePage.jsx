import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWeeklyTimetable } from '../api/auth'
import BackButton from '../components/BackButton'

// ─── 상수 ────────────────────────────────────────────────
const HOUR_HEIGHT  = 56
const START_HOUR   = 9
const END_HOUR     = 23
const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT
const DAY_LABELS   = ['월', '화', '수', '목', '금', '토', '일']
const MONTH_NAMES  = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

// ─── 날짜 유틸 ──────────────────────────────────────────
function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  d.setHours(0, 0, 0, 0)
  return d
}
function addDays(date, n) {
  const d = new Date(date); d.setDate(d.getDate() + n); return d
}
function toDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
function timeToMinutes(str) {
  const [h, m] = str.split(':').map(Number); return h * 60 + m
}
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

// ─── 메인 ────────────────────────────────────────────────
export default function WeeklySchedulePage() {
  const navigate  = useNavigate()
  const today     = (() => { const d = new Date(); d.setHours(0,0,0,0); return d })()

  const [weekStart,    setWeekStart]    = useState(() => getMonday(new Date()))
  const [activeDate,   setActiveDate]   = useState(() => { const d = new Date(); d.setHours(0,0,0,0); return d })
  const [timetable,    setTimetable]    = useState({})
  const [loading,      setLoading]      = useState(false)
  const [tooltip,      setTooltip]      = useState(null)
  const [showPicker,   setShowPicker]   = useState(false)

  const scrollRef = useRef(null)

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // 주 중간 기준으로 월 표시
  const midWeek    = addDays(weekStart, 3)
  const monthLabel = `${String(midWeek.getMonth() + 1).padStart(2, '0')}  ${midWeek.getFullYear()}`

  // ── 데이터 fetch
  useEffect(() => {
    setLoading(true)
    setTooltip(null)
    getWeeklyTimetable(toDateStr(weekStart))
      .then(res => { if (res.isSuccess) setTimetable(res.result?.timetable ?? {}) })
      .catch(() => setTimetable({}))
      .finally(() => setLoading(false))
  }, [weekStart.getTime()])

  // ── 첫 로드 시 현재 시간 기준으로 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      const hour  = Math.max(START_HOUR, Math.min(new Date().getHours() - 1, END_HOUR - 3))
      scrollRef.current.scrollTop = (hour - START_HOUR) * HOUR_HEIGHT
    }
  }, [])

  const goToDate = (date) => {
    const d = new Date(date); d.setHours(0, 0, 0, 0)
    setActiveDate(d)
    setWeekStart(getMonday(d))
    setShowPicker(false)
  }

  const prevWeek = (e) => { e.stopPropagation(); setWeekStart(d => addDays(d, -7)) }
  const nextWeek = (e) => { e.stopPropagation(); setWeekStart(d => addDays(d, +7)) }
  const goToday  = (e) => { e.stopPropagation(); goToDate(new Date()) }

  const handleBlockClick = (e, r) => {
    e.stopPropagation()
    if (tooltip?.reservation?.reservationId === r.reservationId) { setTooltip(null); return }
    const rect  = e.currentTarget.getBoundingClientRect()
    const above = rect.top > 130
    const x     = Math.min(Math.max(rect.left + rect.width / 2, 80), window.innerWidth - 80)
    setTooltip({ reservation: r, x, y: above ? rect.top - 10 : rect.bottom + 10, above })
  }

  return (
    <div
      className="min-h-screen bg-black flex flex-col select-none"
      onClick={() => { setTooltip(null); setShowPicker(false) }}
    >
      {/* ── 헤더 */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-2">
        <BackButton />
        <h1 className="text-white text-lg font-bold flex-1">예약 현황</h1>
        <button
          onClick={goToday}
          className="text-zinc-400 text-xs border border-zinc-800 px-3 py-1 rounded-full
                     active:bg-zinc-900 transition-colors"
        >
          오늘
        </button>
      </div>

      {/* ── 주간 내비게이션 */}
      <div className="flex items-center justify-between px-4 pb-2">
        <button onClick={prevWeek} className="p-2 text-zinc-500 active:text-white transition-colors">
          <ChevronLeft />
        </button>

        {/* 월/연도 탭 → 달력 열기 */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowPicker(v => !v) }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                     active:bg-zinc-900 transition-colors"
        >
          <span className="text-white text-sm font-semibold tracking-[0.25em]">
            {monthLabel}
          </span>
          <svg
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="#71717a" strokeWidth="2"
            className={`transition-transform duration-200 ${showPicker ? 'rotate-180' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <button onClick={nextWeek} className="p-2 text-zinc-500 active:text-white transition-colors">
          <ChevronRight />
        </button>
      </div>

      {/* ── 범례 */}
      <div className="flex gap-4 px-5 pb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
          <span className="text-zinc-500 text-xs">합주</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
          <span className="text-zinc-500 text-xs">드럼</span>
        </div>
      </div>

      {/* ── 요일 헤더 */}
      <div className="flex pl-9 pr-2 pb-2 border-b border-zinc-900">
        {weekDates.map((d, i) => {
          const isToday    = isSameDay(d, today)
          const isActive   = isSameDay(d, activeDate)
          const isWeekend  = i >= 5
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <span className={`text-[10px] ${isWeekend ? 'text-zinc-700' : 'text-zinc-600'}`}>
                {DAY_LABELS[i]}
              </span>
              <span className={`text-[11px] w-6 h-6 flex items-center justify-center rounded-full font-medium
                ${isToday
                  ? 'bg-white text-black font-bold'
                  : isActive
                    ? 'bg-zinc-700 text-white'
                    : isWeekend ? 'text-zinc-700' : 'text-zinc-300'
                }`}>
                {d.getDate()}
              </span>
            </div>
          )
        })}
      </div>

      {/* ── 시간 그리드 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="relative flex pl-9 pr-2" style={{ height: TOTAL_HEIGHT }}>

          {/* 시간 레이블 */}
          {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
            <div
              key={i}
              className="absolute w-9 flex justify-end pr-1.5"
              style={{ top: i * HOUR_HEIGHT - 6, left: 0 }}
            >
              <span className="text-zinc-800 text-[9px]">{START_HOUR + i}</span>
            </div>
          ))}

          {/* 수평 구분선 */}
          {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
            <div
              key={i}
              className="absolute left-9 right-2 border-t border-zinc-900"
              style={{ top: i * HOUR_HEIGHT }}
            />
          ))}

          {/* 요일 컬럼 */}
          {weekDates.map((d, colIdx) => {
            const reservations = timetable[toDateStr(d)] || []
            const isWeekend    = colIdx >= 5
            return (
              <div
                key={colIdx}
                className={`flex-1 relative ${isWeekend ? 'bg-zinc-950/50' : ''}`}
                style={{ height: TOTAL_HEIGHT }}
              >
                {reservations.map((r) => {
                  const startMin      = timeToMinutes(r.startTime)
                  const endMin        = timeToMinutes(r.endTime)
                  const top           = (startMin - START_HOUR * 60) * (HOUR_HEIGHT / 60)
                  const height        = (endMin - startMin) * (HOUR_HEIGHT / 60)
                  if (top + height < 0 || top > TOTAL_HEIGHT) return null
                  const clampedTop    = Math.max(0, top)
                  const clampedHeight = Math.max(Math.min(height, TOTAL_HEIGHT - clampedTop), 14)
                  const isEnsemble    = r.category === 'ENSEMBLE'
                  const isSelected    = tooltip?.reservation?.reservationId === r.reservationId

                  return (
                    <div
                      key={r.reservationId}
                      className={`absolute left-0.5 right-0.5 rounded cursor-pointer transition-all
                        ${isEnsemble ? 'bg-blue-500' : 'bg-orange-400'}
                        ${isSelected ? 'brightness-125 ring-1 ring-white/50' : 'opacity-85 active:opacity-100'}`}
                      style={{ top: clampedTop, height: clampedHeight }}
                      onClick={(e) => handleBlockClick(e, r)}
                    >
                      {clampedHeight > 18 && (
                        <div className="px-1 pt-0.5 leading-tight overflow-hidden">
                          {isEnsemble && r.teamName ? (
                            <>
                              <p className="text-white/90 text-[8px] font-semibold truncate">{r.teamName}</p>
                              {clampedHeight > 30 && (
                                <p className="text-white/60 text-[7px] truncate">{r.nickname}</p>
                              )}
                            </>
                          ) : (
                            <p className="text-white/90 text-[8px] font-medium truncate">{r.nickname}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 로딩 */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none z-40">
          <svg className="animate-spin" width="32" height="32" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="16" stroke="#27272a" strokeWidth="4" />
            <path d="M20 4a16 16 0 0 1 16 16" stroke="white" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* ── 툴팁 말풍선 */}
      {tooltip && (
        <div
          className="fixed z-50"
          style={{
            left:      tooltip.x,
            top:       tooltip.y,
            transform: `translate(-50%, ${tooltip.above ? '-100%' : '0%'})`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative bg-white rounded-2xl px-3.5 py-2.5 shadow-2xl min-w-[148px]">
            <div className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45
              ${tooltip.above ? '-bottom-1.5' : '-top-1.5'}`}
            />
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0
                ${tooltip.reservation.category === 'ENSEMBLE' ? 'bg-blue-500' : 'bg-orange-400'}`}
              />
              <span className="text-black text-[11px] font-bold">
                {tooltip.reservation.category === 'ENSEMBLE' ? '합주' : '드럼'}
              </span>
            </div>
            {tooltip.reservation.category === 'ENSEMBLE' && tooltip.reservation.teamName ? (
              <p className="text-zinc-600 text-[10px] leading-snug">
                <span className="text-zinc-400 font-medium">{tooltip.reservation.teamName}</span>
                <span className="text-zinc-500"> · {tooltip.reservation.nickname}</span>
              </p>
            ) : (
              <p className="text-zinc-600 text-[10px] leading-snug">{tooltip.reservation.nickname}</p>
            )}
            <p className="text-zinc-400 text-[10px] mt-0.5">
              {tooltip.reservation.startTime.slice(0, 5)}
              {' – '}
              {tooltip.reservation.endTime.slice(0, 5)}
            </p>
          </div>
        </div>
      )}

      {/* ── 월 달력 피커 (바텀 시트) */}
      {showPicker && (
        <MonthPicker
          activeDate={activeDate}
          weekStart={weekStart}
          onSelect={goToDate}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}

// ─── 월 달력 피커 ────────────────────────────────────────
function MonthPicker({ activeDate, weekStart, onSelect, onClose }) {
  const today = (() => { const d = new Date(); d.setHours(0,0,0,0); return d })()

  const [viewYear,  setViewYear]  = useState(activeDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(activeDate.getMonth())

  const prevMonth = (e) => {
    e.stopPropagation()
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = (e) => {
    e.stopPropagation()
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  // 달력 셀 생성 (월요일 시작)
  const firstDay     = new Date(viewYear, viewMonth, 1)
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate()
  const startOffset  = (firstDay.getDay() + 6) % 7 // Mon=0 … Sun=6

  const cells = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7))

  const weekEnd  = addDays(weekStart, 6)

  const isInCurrentWeek = (d) => d && d >= weekStart && d <= weekEnd
  const isToday         = (d) => d && isSameDay(d, today)
  const isActive        = (d) => d && isSameDay(d, activeDate)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      onClick={onClose}
    >
      {/* 반투명 배경 */}
      <div className="absolute inset-0 bg-black/40" />

      <div
        className="relative w-full bg-zinc-950 border-t border-zinc-800 rounded-t-3xl
                   px-5 pt-5 pb-10 max-w-[390px] mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 바 */}
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-5" />

        {/* 월 내비게이션 */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 text-zinc-500 active:text-white transition-colors">
            <ChevronLeft />
          </button>
          <span className="text-white text-sm font-semibold">
            {viewYear}년 {MONTH_NAMES[viewMonth]}
          </span>
          <button onClick={nextMonth} className="p-2 text-zinc-500 active:text-white transition-colors">
            <ChevronRight />
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map((l, i) => (
            <div key={i} className={`text-center text-[11px] py-1
              ${i >= 5 ? 'text-zinc-700' : 'text-zinc-600'}`}>
              {l}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((d, di) => {
              if (!d) return <div key={di} />

              const _isToday   = isToday(d)
              const _isActive  = isActive(d)
              const _inWeek    = isInCurrentWeek(d)
              const isWeekend  = di >= 5

              return (
                <button
                  key={di}
                  onClick={() => onSelect(d)}
                  className={`relative h-9 flex items-center justify-center text-xs font-medium
                    transition-colors rounded-full mx-0.5
                    ${_isToday
                      ? 'bg-white text-black font-bold'
                      : _isActive
                        ? 'bg-zinc-600 text-white'
                        : _inWeek
                          ? 'bg-zinc-900 text-zinc-300'
                          : isWeekend
                            ? 'text-zinc-700 active:bg-zinc-900'
                            : 'text-zinc-400 active:bg-zinc-900'
                    }`}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 아이콘 ──────────────────────────────────────────────
function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
    </svg>
  )
}
function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  )
}
