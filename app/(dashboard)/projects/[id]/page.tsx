"use client"

import { useState, useEffect, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import { projectApi, generateApi, type Task, type Project } from "@/lib/api"
import { useToast } from "@/components/ui/toast-provider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ImageWithAuth } from "@/components/ui/image-with-auth"
import { ReferenceImageUpload } from "@/components/ui/reference-image-upload"
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  ImageIcon,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Download,
  SlidersHorizontal,
} from "lucide-react"
import { fileApi } from "@/lib/api"

const MODELS = [
  { value: "nano-banana-fast", label: "快速模式", description: "速度最快，适合快速预览" },
  { value: "nano-banana", label: "标准模式", description: "平衡速度与质量" },
  { value: "nano-banana-pro", label: "专业模式", description: "最高质量，适合最终出图" },
]

const ASPECT_RATIOS = [
  { value: "auto", label: "自动" },
  { value: "1:1", label: "1:1 方形" },
  { value: "16:9", label: "16:9 横屏" },
  { value: "9:16", label: "9:16 竖屏" },
  { value: "4:3", label: "4:3" },
  { value: "3:4", label: "3:4" },
]

const IMAGE_SIZES = [
  { value: "1K", label: "1K" },
  { value: "2K", label: "2K" },
  { value: "4K", label: "4K" },
]

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const projectId = Number.parseInt(resolvedParams.id)
  const router = useRouter()
  const { showToast } = useToast()

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)

  // Form state
  const [prompt, setPrompt] = useState("")
  const [model, setModel] = useState("nano-banana-fast")
  const [aspectRatio, setAspectRatio] = useState("auto")
  const [imageSize, setImageSize] = useState("1K")
  const [referenceFilepaths, setReferenceFilepaths] = useState<string[]>([])

  const fetchTasks = useCallback(async () => {
    try {
      const response = await projectApi.getTasks(projectId)
      if (response.code === 200) {
        setTasks(response.data.tasks || [])
      } else {
        showToast({ title: "获取任务列表失败", description: response.data, type: "error" })
      }
    } catch {
      showToast({ title: "网络错误", description: "请稍后重试", type: "error" })
    }
  }, [projectId, showToast])

  const fetchProjectInfo = useCallback(async () => {
    try {
      const response = await projectApi.getAll()
      if (response.code === 200) {
        const foundProject = response.data.projects?.find((p: Project) => p.id === projectId)
        if (foundProject) {
          setProject(foundProject)
        } else {
          showToast({ title: "项目不存在", type: "error" })
          router.push("/projects")
        }
      }
    } catch {
      showToast({ title: "网络错误", description: "请稍后重试", type: "error" })
    }
  }, [projectId, router, showToast])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchProjectInfo(), fetchTasks()])
      setIsLoading(false)
    }
    loadData()
  }, [fetchProjectInfo, fetchTasks])

  // 自动刷新运行中的任务
  useEffect(() => {
    const hasRunningTasks = tasks.some((t) => t.status === "running")
    if (hasRunningTasks) {
      const interval = setInterval(fetchTasks, 3000)
      return () => clearInterval(interval)
    }
  }, [tasks, fetchTasks])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast({ title: "请输入提示词", type: "error" })
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
        project_id: projectId,
      })

      if (response.code === 200) {
        showToast({ title: "任务创建成功", description: "正在生成中...", type: "success" })
        setPrompt("")
        setReferenceFilepaths([])
        setMobileSheetOpen(false)
        fetchTasks()
      } else {
        showToast({ title: "生成失败", description: response.data, type: "error" })
      }
    } catch {
      showToast({ title: "网络错误", description: "请稍后重试", type: "error" })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async (filepath: string, filename: string) => {
    try {
      const blobUrl = await fileApi.fetchImage(filepath)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = filename || "image.png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch {
      showToast({ title: "下载失败", type: "error" })
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

  const GenerateForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prompt">提示词</Label>
        <Textarea
          id="prompt"
          placeholder="描述您想要生成的图片..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>参考图片（可选）</Label>
        <ReferenceImageUpload filepaths={referenceFilepaths} onFilepathsChange={setReferenceFilepaths} maxFiles={4} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="model">模型</Label>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger id="model">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODELS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                <div>
                  <div>{m.label}</div>
                  <div className="text-xs text-muted-foreground">{m.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="aspectRatio">比例</Label>
        <Select value={aspectRatio} onValueChange={setAspectRatio}>
          <SelectTrigger id="aspectRatio">
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

      <div className="space-y-2">
        <Label htmlFor="imageSize">图片大小</Label>
        <Select value={imageSize} onValueChange={setImageSize}>
          <SelectTrigger id="imageSize">
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

      <Button className="w-full" onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            生成中...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            开始生成
          </>
        )}
      </Button>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b bg-card px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:h-10 md:w-10"
              onClick={() => router.push("/projects")}
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold md:text-xl">{project?.title}</h1>
              <p className="text-xs text-muted-foreground md:text-sm">项目ID: {projectId}</p>
            </div>
          </div>

          <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
            <SheetTrigger asChild>
              <Button className="md:hidden" size="sm">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                生成
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] overflow-auto">
              <SheetHeader className="mb-4">
                <SheetTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  图片生成
                </SheetTitle>
              </SheetHeader>
              <GenerateForm />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Generate Form (桌面端) */}
        <div className="hidden w-80 shrink-0 overflow-auto border-r bg-card p-4 md:block">
          <div className="space-y-4">
            <div>
              <h2 className="mb-3 flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4" />
                图片生成
              </h2>
            </div>
            <GenerateForm />
          </div>
        </div>

        {/* Right Panel - Task List */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mb-3 flex items-center justify-between md:mb-4">
            <h2 className="text-base font-semibold md:text-lg">生成记录</h2>
            <Button variant="outline" size="sm" className="h-8 bg-transparent" onClick={fetchTasks}>
              <RefreshCw className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
              刷新
            </Button>
          </div>

          {tasks.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 md:py-12">
                <div className="mb-4 rounded-full bg-muted p-3 md:p-4">
                  <ImageIcon className="h-6 w-6 text-muted-foreground md:h-8 md:w-8" />
                </div>
                <h3 className="mb-2 text-base font-medium md:text-lg">暂无生成记录</h3>
                <p className="text-xs text-muted-foreground md:text-sm">
                  <span className="hidden md:inline">在左侧</span>
                  <span className="md:hidden">点击上方生成按钮</span>输入提示词，开始您的第一次创作
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
              {tasks.map((task) => (
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
                        <Loader2 className="h-6 w-6 animate-spin text-primary md:h-8 md:w-8" />
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <XCircle className="h-6 w-6 text-destructive md:h-8 md:w-8" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-2 md:p-3">
                    <div className="mb-2 flex items-center justify-between">
                      {getStatusBadge(task.status)}
                      {task.status === "succeeded" && task.result_filepath && (
                        <button
                          onClick={() => handleDownload(task.result_filepath, `image-${task.id}.png`)}
                          className="text-primary hover:underline"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="mb-2 line-clamp-2 text-xs md:text-sm" title={task.prompt}>
                      {task.prompt}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground md:text-xs">
                      <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                      {formatTime(task.create_at)}
                    </div>
                    {task.status === "failed" && task.failure_reason && (
                      <p className="mt-2 text-[10px] text-destructive md:text-xs">{task.failure_reason}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
