import request from '@/utils/request'
export const fileUpload = (file: File, session_id: string) => {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: 'api/file/upload',
    method: 'post',
    data: formData,
    params: {
      session_id,
    },
  })
}

export const fileDownload = (session_id: string) => {
  return request({
    url: 'api/file/download',
    method: 'get',
    data: {
      session_id,
    },
  })
}

export const filePreview = (session_id: string) => {
  return request({
    url: 'api/file/preview',
    method: 'get',
    data: {
      session_id,
    },
  })
}

export const fileClean = (session_id: string, clean_strategy: string) => {
  return request({
    url: 'api/file/clean',
    method: 'post',
    data: {
      session_id,
      clean_strategy,
    },
  })
}
