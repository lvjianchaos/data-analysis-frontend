import request from '@/utils/request'

export type SessionInfo = {
  session_id: string
  name: string
  timestamp?: number
}

export const addSession = (sessionInfo: SessionInfo) => {
  return request({
    method: 'post',
    url: 'api/session/add_session',
    data: sessionInfo,
  })
}

export const deleteSession = (session_id: string) => {
  return request({
    method: 'delete',
    url: `api/session/delete_session/${session_id}`,
  })
}

export type SessionsResult = {
  code: number
  message: string
  data: SessionInfo[]
}

export const getSessions = () => {
  return request<SessionsResult>({
    url: 'api/session/get_sessions',
    method: 'get',
  })
}

export const updateSessionName = (session_id: string, name: string) => {
  return request({
    method: 'put',
    url: `api/session/update_session_name/${session_id}`,
    data: {
      name,
    },
  })
}
