import api from './client'

export const chatWithAssistant = (message) => {
  console.log('[assistant:frontend] Sending chat request', {
    messagePreview: message.slice(0, 120),
    messageLength: message.length,
  })

  return api.post('/api/assistant/chat', { message }).then((response) => {
    console.log('[assistant:frontend] Chat response received', {
      productCount: response.data?.products?.length ?? 0,
      fallback: response.data?.fallback ?? false,
      replyLength: response.data?.reply?.length ?? 0,
    })
    return response
  }).catch((error) => {
    console.error('[assistant:frontend] Chat request failed', {
      message: error.message,
    })
    throw error
  })
}

export const searchProducts = (params) => {
  console.log('[assistant:frontend] Sending search request', { params })

  return api.get('/api/assistant/search', { params }).then((response) => {
    console.log('[assistant:frontend] Search response received', {
      productCount: response.data?.products?.length ?? 0,
      total: response.data?.pagination?.total ?? 0,
    })
    return response
  }).catch((error) => {
    console.error('[assistant:frontend] Search request failed', {
      message: error.message,
    })
    throw error
  })
}
