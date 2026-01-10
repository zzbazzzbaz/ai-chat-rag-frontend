import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminConfigApi } from '@/api'
import type { SystemConfig } from '@/types'
import { Save, TestTube, Loader2 } from 'lucide-react'

export default function SystemSettings() {
  const [config, setConfig] = useState<SystemConfig>({
    system_prompt: '',
    llm_api_url: '',
    llm_api_key: '',
    llm_model_name: '',
    embedding_api_url: '',
    embedding_api_key: '',
    embedding_model_name: '',
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testingLlm, setTestingLlm] = useState(false)
  const [testingEmbedding, setTestingEmbedding] = useState(false)
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
        api_key: config.llm_api_key,
        model_name: config.llm_model_name,
        model_url: config.llm_api_url,
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
        api_key: config.embedding_api_key,
        model_name: config.embedding_model_name,
        model_url: config.embedding_api_url,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">系统设置</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>LLM 模型配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">接口地址</label>
              <Input
                value={config.llm_api_url}
                onChange={(e) => setConfig({ ...config, llm_api_url: e.target.value })}
                placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">API Key</label>
              <Input
                type="password"
                value={config.llm_api_key}
                onChange={(e) => setConfig({ ...config, llm_api_key: e.target.value })}
                placeholder="sk-xxxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">模型名称</label>
              <Input
                value={config.llm_model_name}
                onChange={(e) => setConfig({ ...config, llm_model_name: e.target.value })}
                placeholder="qwen-plus"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleTestLlm} variant="outline" disabled={testingLlm}>
                {testingLlm ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <TestTube className="h-4 w-4 mr-2" />}
                测试连接
              </Button>
              {llmTestResult && (
                <span className={`text-sm py-2 ${llmTestResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {llmTestResult.message}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Embedding 模型配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">接口地址</label>
              <Input
                value={config.embedding_api_url}
                onChange={(e) => setConfig({ ...config, embedding_api_url: e.target.value })}
                placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">API Key</label>
              <Input
                type="password"
                value={config.embedding_api_key}
                onChange={(e) => setConfig({ ...config, embedding_api_key: e.target.value })}
                placeholder="sk-xxxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">模型名称</label>
              <Input
                value={config.embedding_model_name}
                onChange={(e) => setConfig({ ...config, embedding_model_name: e.target.value })}
                placeholder="text-embedding-v4"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleTestEmbedding} variant="outline" disabled={testingEmbedding}>
                {testingEmbedding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <TestTube className="h-4 w-4 mr-2" />}
                测试连接
              </Button>
              {embeddingTestResult && (
                <span className={`text-sm py-2 ${embeddingTestResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {embeddingTestResult.message}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>系统提示词</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={config.system_prompt}
              onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })}
              placeholder="你是一个专业的知识库问答助手..."
              className="w-full h-48 px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            保存配置
          </Button>
        </div>
      </div>
    </div>
  )
}
