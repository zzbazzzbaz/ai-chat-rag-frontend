import { useState, useEffect } from 'react'
import { adminRecommendedQuestionApi } from '@/api'
import type { RecommendedQuestionAdmin } from '@/types'
import { Plus, Pencil, Trash2, Loader2, HelpCircle, ToggleLeft, ToggleRight } from 'lucide-react'

export default function RecommendedQuestions() {
  const [questions, setQuestions] = useState<RecommendedQuestionAdmin[]>([])
  const [loading, setLoading] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<RecommendedQuestionAdmin | null>(null)
  const [newQuestion, setNewQuestion] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const data = await adminRecommendedQuestionApi.getList()
      setQuestions(data)
    } catch (error) {
      console.error('获取推荐问题失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) return
    try {
      await adminRecommendedQuestionApi.create({ content: newQuestion.trim() })
      setNewQuestion('')
      setShowAddForm(false)
      fetchQuestions()
    } catch (error) {
      console.error('添加失败:', error)
      alert('添加失败')
    }
  }

  const handleUpdateQuestion = async (id: number, content: string) => {
    try {
      await adminRecommendedQuestionApi.update(id, { content })
      setEditingQuestion(null)
      fetchQuestions()
    } catch (error) {
      console.error('更新失败:', error)
      alert('更新失败')
    }
  }

  const handleToggleActive = async (question: RecommendedQuestionAdmin) => {
    try {
      await adminRecommendedQuestionApi.update(question.id, { is_active: !question.is_active })
      fetchQuestions()
    } catch (error) {
      console.error('更新失败:', error)
    }
  }

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('确定要删除这个推荐问题吗？')) return
    try {
      await adminRecommendedQuestionApi.delete(id)
      fetchQuestions()
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">推荐问题管理</h1>
          <p className="text-slate-500 mt-1">管理前台展示的推荐问题，前台将随机展示最多 5 条已启用的问题</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-xl hover:from-sky-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-200/50"
        >
          <Plus className="h-4 w-4" />
          添加问题
        </button>
      </div>

      {/* 添加表单 */}
      {showAddForm && (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg shadow-blue-100/30 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">添加推荐问题</h3>
          <div className="flex items-center gap-3">
            <input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="输入推荐问题内容..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
              autoFocus
            />
            <button
              onClick={handleAddQuestion}
              className="px-5 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              确定
            </button>
            <button
              onClick={() => { setShowAddForm(false); setNewQuestion('') }}
              className="px-5 py-3 text-slate-500 hover:text-slate-700 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 问题列表 */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg shadow-blue-100/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <HelpCircle className="h-4 w-4 text-white" />
            </div>
            问题列表
            <span className="ml-2 text-sm font-normal text-slate-500">
              共 {questions.length} 条，已启用 {questions.filter(q => q.is_active).length} 条
            </span>
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>暂无推荐问题</p>
            <p className="text-sm mt-1">点击上方按钮添加</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {questions.map((question) => (
              <div
                key={question.id}
                className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                  question.is_active ? 'bg-white' : 'bg-slate-50/50'
                }`}
              >
                {editingQuestion?.id === question.id ? (
                  <>
                    <input
                      value={editingQuestion.content}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, content: e.target.value })}
                      className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateQuestion(question.id, editingQuestion.content)}
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdateQuestion(question.id, editingQuestion.content)}
                      className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingQuestion(null)}
                      className="px-4 py-2 text-slate-500 text-sm hover:text-slate-700 transition-colors"
                    >
                      取消
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${question.is_active ? 'text-slate-700' : 'text-slate-400'}`}>
                        {question.content}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        创建于 {formatDate(question.created_at)}
                      </p>
                    </div>

                    {/* 启用/禁用开关 */}
                    <button
                      onClick={() => handleToggleActive(question)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        question.is_active
                          ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {question.is_active ? (
                        <>
                          <ToggleRight className="h-4 w-4" />
                          已启用
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-4 w-4" />
                          已禁用
                        </>
                      )}
                    </button>

                    {/* 编辑按钮 */}
                    <button
                      onClick={() => setEditingQuestion(question)}
                      className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    {/* 删除按钮 */}
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
