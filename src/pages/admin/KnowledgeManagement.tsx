import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminKnowledgeApi } from '@/api'
import type { KnowledgeFile, PaginatedResponse } from '@/types'
import { Search, Upload, Trash2, RefreshCw, Eye, ChevronLeft, ChevronRight, Download } from 'lucide-react'

const statusMap: Record<string, { label: string; className: string }> = {
  processing: { label: '处理中', className: 'bg-yellow-100 text-yellow-700' },
  completed: { label: '已完成', className: 'bg-green-100 text-green-700' },
  failed: { label: '失败', className: 'bg-red-100 text-red-700' },
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

  const fetchFiles = useCallback(async () => {
    setLoading(true)
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
      setLoading(false)
    }
  }, [page, keyword, statusFilter])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

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
    <div>
      <h1 className="text-2xl font-bold mb-6">知识库管理</h1>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex gap-2">
              <Input
                placeholder="搜索文件名..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-48"
              />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="">全部状态</option>
                <option value="processing">处理中</option>
                <option value="completed">已完成</option>
                <option value="failed">失败</option>
              </select>
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="ml-auto">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.md"
                onChange={handleUpload}
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? '上传中...' : '上传文件'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">加载中...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">文件名</th>
                      <th className="text-left py-3 px-4">大小</th>
                      <th className="text-left py-3 px-4">类型</th>
                      <th className="text-left py-3 px-4">状态</th>
                      <th className="text-left py-3 px-4">上传时间</th>
                      <th className="text-left py-3 px-4">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files?.items.map((file) => (
                      <tr key={file.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{file.id}</td>
                        <td className="py-3 px-4 max-w-xs truncate" title={file.filename}>{file.filename}</td>
                        <td className="py-3 px-4">{formatFileSize(file.file_size)}</td>
                        <td className="py-3 px-4 uppercase">{file.file_type}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${statusMap[file.status]?.className}`}>
                            {statusMap[file.status]?.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">{new Date(file.created_at).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewDetail(file.id)} title="查看详情">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleReprocess(file.id)} 
                              title="重新解析"
                              disabled={file.status === 'processing'}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(file.id)} title="删除">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-muted-foreground">共 {files?.total} 条</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="px-3 py-1 text-sm">{page} / {totalPages}</span>
                    <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 详情弹窗 */}
      {detailModal.open && detailModal.file && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[500px] max-h-[80vh] overflow-auto">
            <CardHeader>
              <CardTitle>文件详情</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">文件名：</span>{detailModal.file.filename}</div>
              <div><span className="text-muted-foreground">原始文件名：</span>{detailModal.file.original_filename}</div>
              <div><span className="text-muted-foreground">文件大小：</span>{formatFileSize(detailModal.file.file_size)}</div>
              <div><span className="text-muted-foreground">文件类型：</span>{detailModal.file.file_type.toUpperCase()}</div>
              <div><span className="text-muted-foreground">状态：</span>{statusMap[detailModal.file.status]?.label}</div>
              {detailModal.file.error_message && (
                <div><span className="text-muted-foreground">错误信息：</span><span className="text-red-500">{detailModal.file.error_message}</span></div>
              )}
              <div><span className="text-muted-foreground">上传时间：</span>{new Date(detailModal.file.created_at).toLocaleString()}</div>
              {detailModal.file.processed_at && (
                <div><span className="text-muted-foreground">处理完成时间：</span>{new Date(detailModal.file.processed_at).toLocaleString()}</div>
              )}
              {detailModal.file.chunk_count !== undefined && (
                <div><span className="text-muted-foreground">分块数量：</span>{detailModal.file.chunk_count}</div>
              )}
              <div className="pt-4 flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => adminKnowledgeApi.download(detailModal.file!.id, detailModal.file!.filename)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  下载文件
                </Button>
                <Button variant="outline" onClick={() => setDetailModal({ open: false, file: null })} className="flex-1">
                  关闭
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
