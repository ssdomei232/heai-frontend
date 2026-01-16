"use client"

import { useState, useEffect, useCallback } from "react"
import { fileApi, projectApi, type Task } from "@/lib/api"
import { useToast } from "@/components/ui/toast-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ImageWithAuth } from "@/components/ui/image-with-auth"
import { Loader2, ImageIcon, Download, RefreshCw, Clock, CheckCircle2 } from "lucide-react"

export default function GalleryPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()

  const fetchAllTasks = useCallback(async () => {
    try {
      const projectsResponse = await projectApi.getAll()
      if (projectsResponse.code === 200) {
        const projects = projectsResponse.data.projects || []
        const allTasks: Task[] = []

        for (const project of projects) {
          const tasksResponse = await projectApi.getTasks(project.id)
          if (tasksResponse.code === 200 && tasksResponse.data.tasks) {
            allTasks.push(...tasksResponse.data.tasks)
          }
        }

        // 按创建时间排序，最新的在前
        allTasks.sort((a, b) => b.create_at - a.create_at)
        setTasks(allTasks.filter((t) => t.status === "succeeded"))
      }
    } catch {
      showToast({ title: "加载失败", description: "请稍后重试", type: "error" })
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchAllTasks()
  }, [fetchAllTasks])

  const handleDownload = async (filepath: string, taskId: number) => {
    try {
      const blobUrl = await fileApi.fetchImage(filepath)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = `image-${taskId}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch {
      showToast({ title: "下载失败", type: "error" })
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString("zh-CN")
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:mb-6">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">我的图库</h1>
          <p className="text-xs text-muted-foreground md:text-sm">查看您所有成功生成的作品</p>
        </div>
        <Button variant="outline" onClick={fetchAllTasks} className="w-full sm:w-auto bg-transparent">
          <RefreshCw className="mr-2 h-4 w-4" />
          刷新
        </Button>
      </div>

      {tasks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 md:py-12">
            <div className="mb-4 rounded-full bg-muted p-3 md:p-4">
              <ImageIcon className="h-6 w-6 text-muted-foreground md:h-8 md:w-8" />
            </div>
            <h3 className="mb-2 text-base font-medium md:text-lg">暂无作品</h3>
            <p className="text-xs text-muted-foreground md:text-sm">开始生成您的第一张AI图片吧</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {tasks.map((task) => (
            <Card key={task.id} className="group overflow-hidden">
              <div className="relative aspect-square bg-muted">
                {task.result_filepath && (
                  <ImageWithAuth
                    filepath={task.result_filepath}
                    alt={task.prompt}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleDownload(task.result_filepath, task.id)}
                    className="rounded-full bg-white p-2 text-black hover:bg-white/90 md:p-3"
                  >
                    <Download className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                </div>
              </div>
              <CardContent className="p-2 md:p-3">
                <div className="mb-2">
                  <Badge variant="default" className="gap-1 bg-green-500 hover:bg-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    已完成
                  </Badge>
                </div>
                <p className="mb-2 line-clamp-2 text-xs md:text-sm" title={task.prompt}>
                  {task.prompt}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground md:text-xs">
                  <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                  {formatTime(task.create_at)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
