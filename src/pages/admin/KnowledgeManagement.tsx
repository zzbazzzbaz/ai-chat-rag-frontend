import { useState, useEffect, useCallback, useRef } from 'react'
import { adminKnowledgeApi } from '@/api'
import type { KnowledgeFile, PaginatedResponse } from '@/types'
import { Search, Upload, Trash2, RefreshCw, Eye, ChevronLeft, ChevronRight, Database, X, FileText, Loader2, Download } from 'lucide-react'

const statusMap: Record<string, { label: string; className: string }> = {
  processing: { label: '处理中', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed: { label: '已完成', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  failed: { label: '失败', className: 'bg-red-50 text-red-700 border-red-200' },
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function KnowledgeManagement() {
  const [files, setFiles] = useState<PaginatedResponse<KnowledgeFile> | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [detailModal, setDetailModal] = useState<{ open: boolean; file: KnowledgeFile | null }>({ open: false, file: null })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchFiles = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const data = await adminKnowledgeApi.getList({ 
        page, 
        page_size: 20, 
        keyword: keyword || undefined,
        status: statusFilter || undefined 
      })
      setFiles(data)
    } catch (error) {
      console.error('获取知识库列表失败:', error)
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [page, keyword, statusFilter])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  // 当存在 processing 状态的记录时，每秒轮询更新（静默刷新）
  useEffect(() => {
    const hasProcessing = files?.items.some(f => f.status === 'processing')
    if (!hasProcessing) return

    const timer = setInterval(() => {
      fetchFiles(false)
    }, 1000)

    return () => clearInterval(timer)
  }, [files, fetchFiles])

  const handleSearch = () => {
    setPage(1)
    fetchFiles()
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown'
    ]
    const allowedExts = ['.pdf', '.docx', '.txt', '.md']
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    
    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      alert('仅支持 PDF、Word、TXT、Markdown 文档')
      return
    }
    
    if (file.size > 50 * 1024 * 1024) {
      alert('文件大小不能超过 50MB')
      return
    }

    setUploading(true)
    try {
      await adminKnowledgeApi.upload(file)
      fetchFiles()
    } catch (error) {
      console.error('上传失败:', error)
      alert('上传失败')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该文件吗？')) return
    try {
      await adminKnowledgeApi.deleteFile(id)
      fetchFiles()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  const handleReprocess = async (id: number) => {
    try {
      await adminKnowledgeApi.reprocess(id)
      fetchFiles()
    } catch (error) {
      console.error('重新处理失败:', error)
    }
  }

  const handleViewDetail = async (id: number) => {
    try {
      const file = await adminKnowledgeApi.getDetail(id)
      setDetailModal({ open: true, file })
    } catch (error) {
      console.error('获取详情失败:', error)
    }
  }

  const totalPages = files ? Math.ceil(files.total / files.page_size) : 0

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">知识库管理</h1>
        <p className="text-slate-500 mt-1">管理知识库文档，支持 PDF、Word、TXT、Markdown</p>
      </div>
      
      {/* 主卡片 */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg shadow-blue-100/30 overflow-hidden">
        {/* 工具栏 */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/50">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  placeholder="搜索文件名..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-48 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              >
                <option value="">全部状态</option>
                <option value="processing">处理中</option>
                <option value="completed">已完成</option>
                <option value="failed">失败</option>
              </select>
              <button 
                onClick={handleSearch} 
                className="px-4 py-2.5 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-xl hover:from-sky-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-200/50"
              >
                搜索
              </button>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
                <Database className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-emerald-700 font-medium">共 {files?.total || 0} 文件</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.md"
                onChange={handleUpload}
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-xl hover:from-emerald-500 hover:to-teal-600 transition-all shadow-lg shadow-teal-200/50 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? '上传中...' : '上传文件'}
              </button>
            </div>
          </div>
        </div>

        {/* 表格 */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p>加载中...</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="text-left py-4 px-6 font-medium text-slate-600">ID</th>
                  <th className="text-left py-4 px-6 font-medium text-slate-600">文件名</th>
                  <th className="text-left py-4 px-6 font-medium text-slate-600">大小</th>
                  <th className="text-left py-4 px-6 font-medium text-slate-600">类型</th>
                  <th className="text-left py-4 px-6 font-medium text-slate-600">状态</th>
                  <th className="text-left py-4 px-6 font-medium text-slate-600">上传时间</th>
                  <th className="text-left py-4 px-6 font-medium text-slate-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {files?.items.map((file) => (
                  <tr key={file.id} className="border-t border-slate-100 hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-6 text-slate-600">{file.id}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 max-w-xs">
                        <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="font-medium text-slate-800 truncate" title={file.filename}>{file.filename}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{formatFileSize(file.file_size)}</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs uppercase">{file.file_type}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusMap[file.status]?.className}`}>
                        {file.status === 'processing' && <Loader2 className="h-3 w-3 animate-spin" />}
                        {statusMap[file.status]?.label}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{new Date(file.created_at).toLocaleString('zh-CN')}</td>
                    <td className="py-4 px-6">
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleViewDetail(file.id)} 
                          title="查看详情"
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {file.status !== 'processing' && (
                          <button 
                            onClick={() => handleReprocess(file.id)} 
                            title="重新处理"
                            className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(file.id)} 
                          title="删除"
                          className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
            <span className="text-sm text-slate-500">共 {files?.total} 条记录</span>
            <div className="flex items-center gap-2">
              <button 
                disabled={page <= 1} 
                onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>
              <span className="px-4 py-2 text-sm text-slate-600">{page} / {totalPages}</span>
              <button 
                disabled={page >= totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      {detailModal.open && detailModal.file && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-[500px] max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50">
              <h3 className="font-semibold text-slate-800">文件详情</h3>
              <button 
                onClick={() => setDetailModal({ open: false, file: null })}
                className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm overflow-auto max-h-[60vh]">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">文件名</span>
                <span className="text-slate-800 font-medium">{detailModal.file.filename}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">原始文件名</span>
                <span className="text-slate-800">{detailModal.file.original_filename}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">文件大小</span>
                <span className="text-slate-800">{formatFileSize(detailModal.file.file_size)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">文件类型</span>
                <span className="text-slate-800 uppercase">{detailModal.file.file_type}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">状态</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusMap[detailModal.file.status]?.className}`}>
                  {statusMap[detailModal.file.status]?.label}
                </span>
              </div>
              {detailModal.file.error_message && (
                <div className="py-2 border-b border-slate-100">
                  <span className="text-slate-500 block mb-1">错误信息</span>
                  <span className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg block">{detailModal.file.error_message}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">上传时间</span>
                <span className="text-slate-800">{new Date(detailModal.file.created_at).toLocaleString('zh-CN')}</span>
              </div>
              {detailModal.file.processed_at && (
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">处理完成时间</span>
                  <span className="text-slate-800">{new Date(detailModal.file.processed_at).toLocaleString('zh-CN')}</span>
                </div>
              )}
              {detailModal.file.chunk_count !== undefined && (
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">分块数量</span>
                  <span className="text-slate-800 font-medium">{detailModal.file.chunk_count}</span>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <button 
                onClick={() => adminKnowledgeApi.download(detailModal.file!.id, detailModal.file!.original_filename || detailModal.file!.filename)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-xl hover:from-sky-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-200/50"
              >
                <Download className="h-4 w-4" />
                下载文件
              </button>
              <button 
                onClick={() => setDetailModal({ open: false, file: null })}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-white transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
