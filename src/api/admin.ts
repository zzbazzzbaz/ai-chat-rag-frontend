import request from './request'
import type { 
  AdminUser, 
  AdminConversation, 
  AdminConversationDetail,
  KnowledgeFile, 
  SystemConfig, 
  ConfigTestResult,
  PaginatedResponse 
} from '@/types'

// 用户管理接口
export const adminUserApi = {
  // 获取用户列表
  getUsers: (params: { page?: number; page_size?: number; keyword?: string } = {}) =>
    request.get<unknown, PaginatedResponse<AdminUser>>('/admin/users', { params }),

  // 更新用户状态
  updateStatus: (id: number, is_active: boolean) =>
    request.put(`/admin/users/${id}/status`, { is_active }),

  // 重置用户密码
  resetPassword: (id: number, new_password: string) =>
    request.put(`/admin/users/${id}/password`, { new_password }),

  // 删除用户
  deleteUser: (id: number) =>
    request.delete(`/admin/users/${id}`),
}

// 知识库管理接口
export const adminKnowledgeApi = {
  // 获取知识库列表
  getList: (params: { page?: number; page_size?: number; keyword?: string; status?: string } = {}) =>
    request.get<unknown, PaginatedResponse<KnowledgeFile>>('/admin/knowledge', { params }),

  // 上传文件
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post<unknown, { id: number; filename: string; status: string }>('/admin/knowledge/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // 获取文件详情
  getDetail: (id: number) =>
    request.get<unknown, KnowledgeFile>(`/admin/knowledge/${id}`),

  // 删除文件
  deleteFile: (id: number) =>
    request.delete(`/admin/knowledge/${id}`),

  // 重新处理文件
  reprocess: (id: number) =>
    request.post<unknown, { id: number; status: string }>(`/admin/knowledge/${id}/reprocess`),

  // 下载文件
  download: async (id: number, filename: string) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${import.meta.env.BASE_URL}api/v1/admin/knowledge/${id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('下载失败')
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  },
}

// 对话管理接口
export const adminConversationApi = {
  // 获取所有对话列表
  getList: (params: { page?: number; page_size?: number; username?: string; start_date?: string; end_date?: string } = {}) =>
    request.get<unknown, PaginatedResponse<AdminConversation>>('/admin/conversations', { params }),

  // 获取对话详情
  getDetail: (id: number) =>
    request.get<unknown, AdminConversationDetail>(`/admin/conversations/${id}`),

  // 删除对话
  deleteConversation: (id: number) =>
    request.delete(`/admin/conversations/${id}`),
}

// 系统配置接口
export const adminConfigApi = {
  // 获取系统配置
  getConfig: () =>
    request.get<unknown, SystemConfig>('/admin/config'),

  // 更新系统配置
  updateConfig: (config: Partial<SystemConfig>) =>
    request.put('/admin/config', config),

  // 测试 LLM 配置
  testLlmConfig: (config: { api_key: string; model_name: string; base_url: string }) =>
    request.post<unknown, ConfigTestResult>('/admin/config/test-llm', config),

  // 测试 Embedding 配置
  testEmbeddingConfig: (config: { api_key: string; model_name: string; base_url: string }) =>
    request.post<unknown, ConfigTestResult>('/admin/config/test-embedding', config),

  // 上传 Logo
  uploadLogo: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post<unknown, { logo_url: string }>('/admin/config/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // 删除 Logo
  deleteLogo: () =>
    request.delete('/admin/config/logo'),
}


// 仪表盘统计接口
export interface DashboardStats {
  user_count: number
  conversation_count: number
  message_count: number
  knowledge_count: number
}

export const adminDashboardApi = {
  // 获取仪表盘统计数据
  getStats: async (): Promise<DashboardStats> => {
    // 并行获取各项统计
    const [users, conversations, knowledge] = await Promise.all([
      adminUserApi.getUsers({ page: 1, page_size: 1 }),
      adminConversationApi.getList({ page: 1, page_size: 1 }),
      adminKnowledgeApi.getList({ page: 1, page_size: 1 }),
    ])
    return {
      user_count: users.total,
      conversation_count: conversations.total,
      message_count: 0, // 需要后端提供专门的统计接口
      knowledge_count: knowledge.total,
    }
  },
}

// 推荐问题管理接口
import type { RecommendedQuestionAdmin } from '@/types'

export const adminRecommendedQuestionApi = {
  // 获取所有推荐问题
  getList: () =>
    request.get<unknown, RecommendedQuestionAdmin[]>('/admin/recommended-questions'),

  // 添加推荐问题
  create: (data: { content: string; is_active?: boolean }) =>
    request.post<unknown, RecommendedQuestionAdmin>('/admin/recommended-questions', data),

  // 更新推荐问题
  update: (id: number, data: { content?: string; is_active?: boolean }) =>
    request.put(`/admin/recommended-questions/${id}`, data),

  // 删除推荐问题
  delete: (id: number) =>
    request.delete(`/admin/recommended-questions/${id}`),
}
