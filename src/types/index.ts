// 用户相关类型
export interface User {
  id: number
  username: string
  is_admin: boolean
  created_at: string
  last_login?: string | null
}

// 管理后台用户列表项
export interface AdminUser {
  id: number
  username: string
  is_active: boolean
  created_at: string
  last_login?: string | null
}

// 对话相关类型
export interface Conversation {
  id: number
  title: string
  created_at: string
  updated_at: string
  message_count?: number
}

// 管理后台对话列表项
export interface AdminConversation {
  id: number
  title: string
  username: string
  message_count: number
  created_at: string
}

// 管理后台对话详情
export interface AdminConversationDetail {
  id: number
  title: string
  username: string
  created_at: string
  messages: Message[]
}

// 消息相关类型
export interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

// 知识库文件类型
export interface KnowledgeFile {
  id: number
  filename: string
  original_filename?: string
  file_size: number
  file_type: 'pdf' | 'docx' | 'txt' | 'md'
  status: 'processing' | 'completed' | 'failed'
  error_message?: string | null
  created_at: string
  processed_at?: string | null
  chunk_count?: number
  file_url?: string
}

// 系统配置
export interface SystemConfig {
  system_prompt: string
  llm_api_url: string
  llm_api_key: string
  llm_model_name: string
  embedding_api_url: string
  embedding_api_key: string
  embedding_model_name: string
}

// 配置测试请求
export interface ConfigTestRequest {
  api_key: string
  model_name?: string
  model_url?: string
}

// 配置测试结果
export interface ConfigTestResult {
  success: boolean
  response_time: number
}

// API 响应类型
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 分页响应
export interface PaginatedResponse<T> {
  total: number
  page: number
  page_size: number
  items: T[]
}

// 登录参数
export interface LoginParams {
  username: string
  password: string
  remember?: boolean
}

// 注册参数
export interface RegisterParams {
  username: string
  password: string
  confirm_password: string
}

// 登录响应
export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: User
}

// 用户统计
export interface UserStats {
  conversation_count: number
  message_count: number
  token_count: number
}

// 推荐问题（前台）
export interface RecommendedQuestion {
  id: number
  content: string
}

// 推荐问题（管理端）
export interface RecommendedQuestionAdmin {
  id: number
  content: string
  is_active: boolean
  created_at: string
  updated_at: string
}
