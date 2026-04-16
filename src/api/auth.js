import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청마다 JWT 토큰 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 응답 처리
api.interceptors.response.use(
  (response) => {
    // HTTP 200이지만 isSuccess: false인 경우 에러로 처리
    if (response.data?.isSuccess === false) {
      const err = new Error(response.data.message || '요청에 실패했습니다.')
      err.response = response
      return Promise.reject(err)
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

/**
 * 카카오 ID로 로그인 시도
 * 200 → 토큰 반환, 404 → USER_NOT_FOUND (회원가입 필요)
 */
export const login = async (kakaoId) => {
  const { data } = await api.post('/api/v0/auth/login', { kakaoId })
  return data
}

export const signup = async (body) => {
  const { data } = await api.post('/api/v0/auth/signup', body)
  return data
}

export const checkNickname = async (nickname) => {
  const { data } = await api.get('/api/v0/auth/check-nickname', { params: { nickname } })
  return data
}

export const logout = async () => {
  const { data } = await api.post('/api/v0/user/logout')
  return data
}

export const withdraw = async () => {
  const { data } = await api.delete('/api/v0/user/withdraw')
  return data
}

export const getUserInfo = async () => {
  const { data } = await api.get('/api/v0/user/info')
  return data
}

export const getWeeklyTimetable = async (date) => {
  const { data } = await api.get('/api/v0/reservations/weekly', { params: { date } })
  return data
}

export const checkAvailability = async (date) => {
  const { data } = await api.get('/api/v0/reservations/check-availability', { params: { date } })
  return data
}

export const createReservations = async (reservationList) => {
  const { data } = await api.post('/api/v0/reservations', { reservationList })
  return data
}

export const getActiveReservations = async () => {
  const { data } = await api.get('/api/v0/reservations/active')
  return data
}

export const updateSetting = async (body) => {
  const { data } = await api.patch('/api/v0/settings/1', body)
  return data
}

export const deleteReservation = async (reservationId) => {
  const { data } = await api.delete(`/api/v0/reservations/${reservationId}`)
  return data
}

export const updateReservation = async (reservationId, body) => {
  const { data } = await api.patch(`/api/v0/reservations/${reservationId}`, body)
  return data
}

export const updateUserInfo = async (body) => {
  const { data } = await api.patch('/api/v0/user/info', body)
  return data
}

export default api
