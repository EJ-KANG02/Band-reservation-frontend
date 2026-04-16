import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getActiveReservations, deleteReservation } from '../api/auth'
import BackButton from '../components/BackButton'


const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const day = DAY_NAMES[new Date(y, m - 1, d).getDay()]
  return `${y}/${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')} (${day})`
}

export default function MyReservationsPage() {
  const navigate = useNavigate()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 삭제 모달
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getActiveReservations()
      if (res.isSuccess && res.result) {
        const list = res.result.reservationList || []
        list.sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date)
          return a.startTime.localeCompare(b.startTime)
        })
        setReservations(list)
      }
    } catch (err) {
      setError(err.response?.data?.message || '예약 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  /* ── 삭제 ── */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    setDeleteError('')
    try {
      await deleteReservation(deleteTarget.reservationId)
      setReservations((prev) => prev.filter((r) => r.reservationId !== deleteTarget.reservationId))
      setDeleteTarget(null)
    } catch (err) {
      const status = err.response?.status
      if (status === 403) {
        setDeleteError('본인의 예약만 삭제할 수 있습니다.')
      } else {
        setDeleteError(err.response?.data?.message || '삭제에 실패했습니다.')
      }
    } finally {
      setDeleteLoading(false)
    }
  }

  const closeDeleteModal = () => {
    if (deleteLoading) return
    setDeleteTarget(null)
    setDeleteError('')
  }

  /* ── 수정 → 예약 화면으로 이동 ── */
  const openEdit = (r) => {
    navigate('/reservation', { state: { editMode: true, reservation: r } })
  }

  const ensemble = reservations.filter((r) => r.category === 'ENSEMBLE')
  const drum     = reservations.filter((r) => r.category === 'DRUM')

  return (
    <div className="min-h-screen bg-black flex flex-col px-6 safe-top safe-bottom pb-12">
      <div className="pt-12 mb-6">
        <BackButton />
      </div>
      <h1 className="text-xl font-bold text-white mb-8">예약 확인/취소</h1>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-zinc-600 text-sm">불러오는 중...</span>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <Section
            title="합주 예약"
            items={ensemble}
            emptyText="합주 예약이 없습니다."
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
          <Section
            title="드럼 연습 예약"
            items={drum}
            emptyText="드럼 연습 예약이 없습니다."
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <Modal onClose={closeDeleteModal}>
          <p className="text-white text-base font-semibold text-center mb-2">예약을 삭제할까요?</p>
          <p className="text-zinc-500 text-sm text-center mb-6">
            {formatDate(deleteTarget.date)}&nbsp;&nbsp;
            {deleteTarget.startTime.slice(0, 5)} – {deleteTarget.endTime.slice(0, 5)}
          </p>
          {deleteError && (
            <p className="text-red-400 text-xs text-center mb-4">{deleteError}</p>
          )}
          {!deleteError ? (
            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 py-3 bg-red-500 text-white rounded-2xl text-sm font-bold
                           active:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? '삭제 중...' : '삭제'}
              </button>
              <button
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                className="flex-1 py-3 bg-zinc-800 text-zinc-300 rounded-2xl text-sm font-medium
                           active:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              onClick={closeDeleteModal}
              className="w-full py-3 bg-zinc-800 text-zinc-300 rounded-2xl text-sm font-medium
                         active:bg-zinc-700 transition-colors"
            >
              확인
            </button>
          )}
        </Modal>
      )}

    </div>
  )
}

function Section({ title, items, emptyText, onEdit, onDelete }) {
  return (
    <div>
      <h2 className="text-white text-sm font-semibold mb-3">{title}</h2>
      {items.length === 0 ? (
        <p className="text-zinc-600 text-sm pl-1">{emptyText}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((r) => (
            <ReservationCard key={r.reservationId} r={r} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

function ReservationCard({ r, onEdit, onDelete }) {
  const myNickname = localStorage.getItem('userNickname') || ''
  const isMe = r.nickname === myNickname

  return (
    <div className="bg-zinc-900 rounded-2xl px-4 py-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-semibold">{formatDate(r.date)}</span>
          {r.ongoing && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              진행 중
            </span>
          )}
        </div>
        <p className="text-xs">
          <span className={isMe ? 'text-zinc-400' : 'text-zinc-600'}>{r.nickname}</span>
          {isMe && <span className="ml-1.5 text-zinc-600">· 내 예약</span>}
        </p>
      </div>
      <p className="text-zinc-400 text-sm mb-4">
        {r.startTime.slice(0, 5)} – {r.endTime.slice(0, 5)}
      </p>
      {isMe && (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(r)}
            className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-medium
                       active:bg-zinc-700 transition-colors"
          >
            수정
          </button>
          <button
            onClick={() => onDelete(r)}
            className="flex-1 py-2 rounded-xl bg-zinc-800 text-red-400 text-sm font-medium
                       active:bg-zinc-700 transition-colors"
          >
            삭제
          </button>
        </div>
      )}
    </div>
  )
}

function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-8"
      onClick={onClose}
    >
      <div
        className="w-full bg-zinc-900 rounded-3xl p-6 border border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

