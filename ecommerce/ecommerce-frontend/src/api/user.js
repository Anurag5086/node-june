import api from './client'

export const updateUser = (data) => api.put('/api/user/update-user', data)
