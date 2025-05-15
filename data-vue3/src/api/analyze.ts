import request from '@/utils/request'

export const analyzePredict = (session_id: string, algorithm: string) => {
  return request({
    url: '/analyze/predict',
    method: 'get',
    params: {
      session_id,
      algorithm,
    },
  })
}
