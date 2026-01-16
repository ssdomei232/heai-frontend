"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { projectApi, type Project } from "@/lib/api"
import { useToast } from "@/components/ui/toast-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { FolderOpen, Plus, Trash2, Loader2, Calendar, ArrowRight } from "lucide-react"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newProjectTitle, setNewProjectTitle] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const { showToast } = useToast()
  const router = useRouter()

  const fetchProjects = useCallback(async () => {
    try {
      const response = await projectApi.getAll()
      if (response.code === 200) {
        setProjects(response.data.projects || [])
      } else {
        showToast({ title: "获取项目列表失败", description: response.data, type: "error" })
      }
    } catch {
      showToast({ title: "网络错误", description: "请稍后重试", type: "error" })
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) {
      showToast({ title: "请输入项目名称", type: "error" })
      return
    }

    setIsCreating(true)
    try {
      const response = await projectApi.create(newProjectTitle.trim())
      if (response.code === 200) {
        showToast({ title: "项目创建成功", type: "success" })
        setNewProjectTitle("")
        setCreateDialogOpen(false)
        fetchProjects()
      } else {
        showToast({ title: "创建失败", description: response.data, type: "error" })
      }
    } catch {
      showToast({ title: "网络错误", description: "请稍后重试", type: "error" })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete) return

    try {
      const response = await projectApi.delete(projectToDelete.id)
      if (response.code === 200) {
        showToast({ title: "项目删除成功", type: "success" })
        fetchProjects()
      } else {
        showToast({ title: "删除失败", description: response.data, type: "error" })
      }
    } catch {
      showToast({ title: "网络错误", description: "请稍后重试", type: "error" })
    } finally {
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header - 移动端优化 */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:mb-6">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">项目管理</h1>
          <p className="text-xs text-muted-foreground md:text-sm">管理您的创作项目，每个项目可包含多个生成任务</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              新建项目
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 max-w-md">
            <DialogHeader>
              <DialogTitle>创建新项目</DialogTitle>
              <DialogDescription>为您的创作取一个名字，方便管理和查找</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">项目名称</Label>
                <Input
                  id="title"
                  placeholder="例如：产品海报设计"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                />
              </div>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="w-full sm:w-auto">
                取消
              </Button>
              <Button onClick={handleCreateProject} disabled={isCreating} className="w-full sm:w-auto">
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                创建
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Project List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 md:py-12">
            <div className="mb-4 rounded-full bg-muted p-3 md:p-4">
              <FolderOpen className="h-6 w-6 text-muted-foreground md:h-8 md:w-8" />
            </div>
            <h3 className="mb-2 text-base font-medium md:text-lg">暂无项目</h3>
            <p className="mb-4 text-center text-xs text-muted-foreground md:text-sm">
              创建您的第一个项目，开始AI创作之旅
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              新建项目
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="group cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              <CardHeader className="p-4 pb-2 md:p-6 md:pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 md:h-10 md:w-10">
                    <FolderOpen className="h-4 w-4 text-primary md:h-5 md:w-5" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      setProjectToDelete(project)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <CardTitle className="text-base md:text-lg">{project.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs md:text-sm">
                  <Calendar className="h-3 w-3" />
                  {formatDate(project.create_at)}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                <div className="flex items-center justify-end text-xs text-primary md:text-sm">
                  <span>进入项目</span>
                  <ArrowRight className="ml-1 h-3.5 w-3.5 md:h-4 md:w-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="mx-4 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除项目？</AlertDialogTitle>
            <AlertDialogDescription>
              您即将删除项目「{projectToDelete?.title}」，此操作不可撤销，项目下的所有生成任务也将被删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="w-full sm:w-auto">取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
