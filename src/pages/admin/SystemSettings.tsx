import { useState, useEffect, useRef } from 'react'
import { adminConfigApi } from '@/api'
import type { SystemConfig } from '@/types'
import { Save, TestTube, Loader2, Cpu, MessageSquare, CheckCircle, XCircle, Sparkles, Settings, Upload, Trash2, Image } from 'lucide-react'

export default function SystemSettings() {
  const [config, setConfig] = useState<SystemConfig>({
    system_prompt: '',
    llm_api_url: '',
    llm_api_key: '',
    llm_model_name: '',
    embedding_api_url: '',
    embedding_api_key: '',
    embedding_model_name: '',
    app_name: '知识库问答助手',
    logo_url: null,
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testingLlm, setTestingLlm] = useState(false)
  const [testingEmbedding, setTestingEmbedding] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [llmTestResult, setLlmTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [embeddingTestResult, setEmbeddingTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const data = await adminConfigApi.getConfig()
      setConfig(data)
    } catch (error) {
      console.error('获取配置失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminConfigApi.updateConfig(config)
      alert('配置保存成功')
    } catch (error) {
      console.error('保存配置失败:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleTestLlm = async () => {
    setTestingLlm(true)
    setLlmTestResult(null)
    try {
      const result = await adminConfigApi.testLlmConfig({
        base_url: config.llm_api_url,
        api_key: config.llm_api_key,
        model_name: config.llm_model_name,
      })
      setLlmTestResult({
        success: result.success,
        message: result.success ? `测试成功，响应时间: ${result.response_time}ms` : '测试失败',
      })
    } catch (error) {
      setLlmTestResult({
        success: false,
        message: error instanceof Error ? error.message : '测试失败',
      })
    } finally {
      setTestingLlm(false)
    }
  }

  const handleTestEmbedding = async () => {
    setTestingEmbedding(true)
    setEmbeddingTestResult(null)
    try {
      const result = await adminConfigApi.testEmbeddingConfig({
        base_url: config.embedding_api_url,
        api_key: config.embedding_api_key,
        model_name: config.embedding_model_name,
      })
      setEmbeddingTestResult({
        success: result.success,
        message: result.success ? `测试成功，响应时间: ${result.response_time}ms` : '测试失败',
      })
    } catch (error) {
      setEmbeddingTestResult({
        success: false,
        message: error instanceof Error ? error.message : '测试失败',
      })
    } finally {
      setTestingEmbedding(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    try {
      const result = await adminConfigApi.uploadLogo(file)
      setConfig({ ...config, logo_url: result.logo_url })
      alert('Logo 上传成功')
    } catch (error) {
      console.error('上传失败:', error)
      alert('Logo 上传失败')
    } finally {
      setUploadingLogo(false)
      if (logoInputRef.current) logoInputRef.current.value = ''
    }
  }

  const handleDeleteLogo = async () => {
    if (!confirm('确定要删除 Logo 吗？')) return
    try {
      await adminConfigApi.deleteLogo()
      setConfig({ ...config, logo_url: null })
      alert('Logo 已删除')
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-slate-500">加载配置中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">系统设置</h1>
        <p className="text-slate-500 mt-1">配置 AI 模型和系统参数</p>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        {/* LLM 模型配置 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg shadow-blue-100/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/50">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
                <Cpu className="h-4 w-4 text-white" />
              </div>
              对话模型配置
            </h3>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">接口地址</label>
              <input
                value={config.llm_api_url}
                onChange={(e) => setConfig({ ...config, llm_api_url: e.target.value })}
                placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">API Key</label>
              <input
                type="password"
                value={config.llm_api_key}
                onChange={(e) => setConfig({ ...config, llm_api_key: e.target.value })}
                placeholder="sk-xxxx"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">模型名称</label>
              <input
                value={config.llm_model_name}
                onChange={(e) => setConfig({ ...config, llm_model_name: e.target.value })}
                placeholder="qwen-plus"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleTestLlm} disabled={testingLlm}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50">
                {testingLlm ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
                测试连接
              </button>
              {llmTestResult && (
                <div className={`flex items-center gap-2 text-sm ${llmTestResult.success ? 'text-emerald-600' : 'text-red-600'}`}>
                  {llmTestResult.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {llmTestResult.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Embedding 模型配置 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg shadow-blue-100/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/50">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              嵌入模型配置
            </h3>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">接口地址</label>
              <input
                value={config.embedding_api_url}
                onChange={(e) => setConfig({ ...config, embedding_api_url: e.target.value })}
                placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">API Key</label>
              <input
                type="password"
                value={config.embedding_api_key}
                onChange={(e) => setConfig({ ...config, embedding_api_key: e.target.value })}
                placeholder="sk-xxxx"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">模型名称</label>
              <input
                value={config.embedding_model_name}
                onChange={(e) => setConfig({ ...config, embedding_model_name: e.target.value })}
                placeholder="text-embedding-v3"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleTestEmbedding} disabled={testingEmbedding}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50">
                {testingEmbedding ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
                测试连接
              </button>
              {embeddingTestResult && (
                <div className={`flex items-center gap-2 text-sm ${embeddingTestResult.success ? 'text-emerald-600' : 'text-red-600'}`}>
                  {embeddingTestResult.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {embeddingTestResult.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 应用配置 */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg shadow-blue-100/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <Settings className="h-4 w-4 text-white" />
            </div>
            应用配置
          </h3>
        </div>
        <div className="p-6 grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">应用名称</label>
            <input
              value={config.app_name}
              onChange={(e) => setConfig({ ...config, app_name: e.target.value })}
              placeholder="知识库问答助手"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <p className="text-xs text-slate-400 mt-2">显示在页面标题和侧边栏的应用名称</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">应用 Logo</label>
            <div className="flex items-center gap-4">
              {config.logo_url ? (
                <div className="relative">
                  <img
                    src={config.logo_url}
                    alt="Logo"
                    className="w-16 h-16 rounded-xl object-contain border border-slate-200 bg-white"
                  />
                  <button
                    onClick={handleDeleteLogo}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                  <Image className="h-6 w-6 text-slate-400" />
                </div>
              )}
              <div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {config.logo_url ? '更换 Logo' : '上传 Logo'}
                </button>
                <p className="text-xs text-slate-400 mt-2">支持 PNG、JPG、SVG，最大 5MB</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 系统提示词 */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg shadow-blue-100/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            系统提示词
          </h3>
        </div>
        <div className="p-6">
          <textarea
            value={config.system_prompt}
            onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })}
            placeholder="你是一个专业的航天知识助手..."
            className="w-full h-40 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
          />
          <p className="text-xs text-slate-400 mt-2">设置 AI 助手的角色和行为规范</p>
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-xl hover:from-sky-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-200/50 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          保存配置
        </button>
      </div>
    </div>
  )
}
