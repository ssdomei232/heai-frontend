"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { projectApi, generateApi, type Project, type Task } from "@/lib/api"
import { useToast } from "@/components/ui/toast-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ImageWithAuth } from "@/components/ui/image-with-auth"
import { ReferenceImageUpload } from "@/components/ui/reference-image-upload"
import {
  Loader2,
  Sparkles,
  Plus,
  FolderOpen,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  ImageIcon,
  Zap,
} from "lucide-react"

const MODELS = [
  { value: "nano-banana-fast", label: "快速模式", description: "速度最快" },
  { value: "nano-banana", label: "标准模式", description: "平衡速度与质量" },
  { value: "nano-banana-pro", label: "专业模式", description: "最高质量" },
]

const ASPECT_RATIOS = [
  { value: "auto", label: "自动" },
  { value: "1:1", label: "1:1 方形" },
  { value: "16:9", label: "16:9 横屏" },
  { value: "9:16", label: "9:16 竖屏" },
]

const IMAGE_SIZES = [
  { value: "1K", label: "1K" },
  { value: "2K", label: "2K" },
  { value: "4K", label: "4K" },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  // Form state
  const [prompt, setPrompt] = useState("")
  const [model, setModel] = useState("nano-banana-fast")
  const [aspectRatio, setAspectRatio] = useState("auto")
  const [imageSize, setImageSize] = useState("1K")
  const [referenceFilepaths, setReferenceFilepaths] = useState<string[]>([])

  // Create project dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newProjectTitle, setNewProjectTitle] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const fetchProjects = useCallback(async () => {
    try {
      const response = await projectApi.getAll()
      if (response.code === 200) {
        const projectList = response.data.projects || []
        setProjects(projectList)
        if (projectList.length > 0 && !selectedProject) {
          setSelectedProject(projectList[0].id)
        }
      }
    } catch {
      console.error("Failed to fetch projects")
    }
  }, [selectedProject])

  const fetchRecentTasks = useCallback(async () => {
    if (!selectedProject) return
    try {
      const response = await projectApi.getTasks(selectedProject)
      if (response.code === 200) {
        setRecentTasks((response.data.tasks || []).slice(0, 6))
      }
    } catch {
      console.error("Failed to fetch tasks")
    }
  }, [selectedProject])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await fetchProjects()
      setIsLoading(false)
    }
    loadData()
  }, [fetchProjects])

  useEffect(() => {
    if (selectedProject) {
      fetchRecentTasks()
    }
  }, [selectedProject, fetchRecentTasks])

  // 自动刷新运行中的任务
  useEffect(() => {
    const hasRunningTasks = recentTasks.some((t) => t.status === "running")
    if (hasRunningTasks) {
      const interval = setInterval(fetchRecentTasks, 3000)
      return () => clearInterval(interval)
    }
  }, [recentTasks, fetchRecentTasks])

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
        await fetchProjects()
        // 选中新创建的项目
        const refreshed = await projectApi.getAll()
        if (refreshed.code === 200 && refreshed.data.projects?.length > 0) {
          const newest = refreshed.data.projects[refreshed.data.projects.length - 1]
          setSelectedProject(newest.id)
        }
      } else {
        showToast({ title: "创建失败", description: response.data, type: "error" })
      }
    } catch {
      showToast({ title: "网络错误", type: "error" })
    } finally {
      setIsCreating(false)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast({ title: "请输入提示词", type: "error" })
      return
    }

    if (!selectedProject) {
      showToast({ title: "请先选择或创建一个项目", type: "error" })
      return
    }

    setIsGenerating(true)
    try {
      const response = await generateApi.image({
        prompt: prompt.trim(),
        model: model as "nano-banana" | "nano-banana-pro" | "nano-banana-fast",
        aspectRatio,
        imageSize: imageSize as "1K" | "2K" | "4K",
        filepaths: referenceFilepaths,
        project_id: selectedProject,
      })

      if (response.code === 200) {
        showToast({ title: "任务创建成功", description: "正在生成中...", type: "success" })
        setPrompt("")
        setReferenceFilepaths([]) // 清空参考图片
        fetchRecentTasks()
      } else {
        showToast({ title: "生成失败", description: response.data, type: "error" })
      }
    } catch {
      showToast({ title: "网络错误", type: "error" })
    } finally {
      setIsGenerating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            生成中
          </Badge>
        )
      case "succeeded":
        return (
          <Badge variant="default" className="gap-1 bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="h-3 w-3" />
            已完成
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            失败
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
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
      {/* Welcome Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl font-bold md:text-2xl">欢迎回来，{user?.username}</h1>
        <p className="text-sm text-muted-foreground md:text-base">使用 AI 创作精美图片，释放您的创意潜能</p>
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        {/* Main Generation Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              快速生成
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">输入描述，AI 将为您生成对应图片</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            {/* Project Selection - 移动端优化 */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <Label>选择项目</Label>
                {projects.length > 0 ? (
                  <Select
                    value={selectedProject?.toString() || ""}
                    onValueChange={(v) => setSelectedProject(Number.parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择一个项目" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex h-10 items-center rounded-md border border-dashed px-3 text-sm text-muted-foreground">
                    暂无项目，请先创建
                  </div>
                )}
              </div>
              <Button variant="outline" onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                新建项目
              </Button>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <Label htmlFor="prompt">提示词</Label>
              <Textarea
                id="prompt"
                placeholder="描述您想要生成的图片，例如：一只可爱的猫咪在花园里玩耍，阳光明媚，水彩风格..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>参考图片（可选）</Label>
              <ReferenceImageUpload
                filepaths={referenceFilepaths}
                onFilepathsChange={setReferenceFilepaths}
                maxFiles={4}
              />
            </div>

            {/* Options - 移动端2列，桌面3列 */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
              <div className="space-y-2">
                <Label className="text-xs md:text-sm">模型</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-sm">比例</Label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASPECT_RATIOS.map((ar) => (
                      <SelectItem key={ar.value} value={ar.value}>
                        {ar.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2 sm:col-span-1">
                <Label className="text-xs md:text-sm">尺寸</Label>
                <Select value={imageSize} onValueChange={setImageSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IMAGE_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleGenerate} disabled={isGenerating || !selectedProject}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  立即生成
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Stats Card - 移动端全宽 */}
        <div className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader className="p-4 pb-2 md:p-6 md:pb-3">
              <CardTitle className="text-sm md:text-base">我的账户</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground md:text-sm">可用积分</span>
                <span className="text-xl font-bold text-primary md:text-2xl">{user?.point || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2 md:p-6 md:pb-3">
              <CardTitle className="flex items-center justify-between text-sm md:text-base">
                <span>我的项目</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs md:h-8 md:text-sm"
                  onClick={() => router.push("/projects")}
                >
                  查看全部
                  <ArrowRight className="ml-1 h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              {projects.length === 0 ? (
                <div className="flex flex-col items-center py-4 text-center">
                  <FolderOpen className="mb-2 h-6 w-6 text-muted-foreground md:h-8 md:w-8" />
                  <p className="text-xs text-muted-foreground md:text-sm">暂无项目</p>
                  <Button
                    variant="link"
                    className="mt-2 h-auto p-0 text-xs md:text-sm"
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    创建第一个项目
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.slice(0, 3).map((project) => (
                    <div
                      key={project.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg p-2 hover:bg-accent"
                      onClick={() => router.push(`/projects/${project.id}`)}
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary/10 md:h-8 md:w-8">
                        <FolderOpen className="h-3.5 w-3.5 text-primary md:h-4 md:w-4" />
                      </div>
                      <span className="flex-1 truncate text-xs md:text-sm">{project.title}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground md:h-4 md:w-4" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Tasks - 移动端优化网格 */}
      {selectedProject && recentTasks.length > 0 && (
        <div className="mt-6 md:mt-8">
          <div className="mb-3 flex items-center justify-between md:mb-4">
            <h2 className="text-base font-semibold md:text-lg">最近生成</h2>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs md:text-sm bg-transparent"
              onClick={() => router.push(`/projects/${selectedProject}`)}
            >
              查看全部
              <ArrowRight className="ml-1 h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6">
            {recentTasks.map((task) => (
              <Card key={task.id} className="overflow-hidden">
                <div className="aspect-square bg-muted">
                  {task.status === "succeeded" && task.result_filepath ? (
                    <ImageWithAuth
                      filepath={task.result_filepath}
                      alt={task.prompt}
                      className="h-full w-full object-cover"
                    />
                  ) : task.status === "running" ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-primary md:h-6 md:w-6" />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-muted-foreground md:h-6 md:w-6" />
                    </div>
                  )}
                </div>
                <CardContent className="p-2">
                  <div className="mb-1">{getStatusBadge(task.status)}</div>
                  <p className="line-clamp-1 text-[10px] text-muted-foreground md:text-xs" title={task.prompt}>
                    {task.prompt}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground md:text-xs">
                    <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    {formatTime(task.create_at)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
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
  )
}
