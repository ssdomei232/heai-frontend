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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageWithAuth } from "@/components/ui/image-with-auth"
import { VideoWithAuth } from "@/components/ui/video-with-auth"
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
  Video,
  Film,
  Play,
} from "lucide-react"
import { fileApi } from "@/lib/api"

const IMAGE_MODELS = [
  { value: "nano-banana-fast", label: "nano-banana-fast", description: "速度最快，适合快速预览" },
  { value: "nano-banana", label: "nano-banana", description: "平衡速度与质量" },
  { value: "nano-banana-pro", label: "nano-banana-pro", description: "最高质量，适合最终出图" },
]

const IMAGE_ASPECT_RATIOS = [
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

const VIDEO_ASPECT_RATIOS = [
  { value: "16:9", label: "16:9 横屏" },
  { value: "9:16", label: "9:16 竖屏" },
]

const VIDEO_DURATIONS = [
  { value: 10, label: "10秒" },
  { value: 15, label: "15秒" },
]

const VIDEO_SIZES = [
  { value: "small", label: "标清", description: "480p" },
  { value: "large", label: "高清", description: "1080p" },
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

  const [generateType, setGenerateType] = useState<"image" | "video">("image")
  const [filterType, setFilterType] = useState<"all" | "image" | "video">("all")
  
  // 添加卡片大小状态
  const [cardSize, setCardSize] = useState<"sm" | "md" | "lg">("md")

  // Image Form state
  const [prompt, setPrompt] = useState("")
  const [model, setModel] = useState("nano-banana-fast")
  const [aspectRatio, setAspectRatio] = useState("auto")
  const [imageSize, setImageSize] = useState("1K")
  const [referenceFilepaths, setReferenceFilepaths] = useState<string[]>([])

  const [videoPrompt, setVideoPrompt] = useState("")
  const [videoAspectRatio, setVideoAspectRatio] = useState<"16:9" | "9:16">("16:9")
  const [videoDuration, setVideoDuration] = useState<10 | 15>(10)
  const [videoSize, setVideoSize] = useState<"small" | "large">("large")
  const [videoFilepath, setVideoFilepath] = useState("")
  const [remixTargetID, setRemixTargetID] = useState("")

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

  const handleGenerateImage = async () => {
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

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) {
      showToast({ title: "请输入提示词", type: "error" })
      return
    }

    setIsGenerating(true)
    try {
      const response = await generateApi.video({
        prompt: videoPrompt.trim(),
        model: "sora-2",
        aspectRatio: videoAspectRatio,
        duration: videoDuration,
        filepath: videoFilepath,
        remixTargetID: remixTargetID,
        size: videoSize,
        project_id: projectId,
      })

      if (response.code === 200) {
        showToast({ title: "视频任务创建成功", description: "正在生成中...", type: "success" })
        setVideoPrompt("")
        setVideoFilepath("")
        setRemixTargetID("")
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

  const handleDownload = async (filepath: string, filename: string, isVideo = false) => {
    try {
      const blobUrl = isVideo ? await fileApi.fetchVideo(filepath) : await fileApi.fetchImage(filepath)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch {
      showToast({ title: "下载失败", type: "error" })
    }
  }

  const handleUseAsVideoReference = (filepath: string) => {
    setVideoFilepath(filepath)
    setGenerateType("video")
    showToast({ title: "已选择参考图", description: "已切换到视频生成模式", type: "success" })
  }

  const handleUseAsVideoSequel = (pid: string) => {
    setRemixTargetID(pid)
    setGenerateType("video")
    showToast({ title: "已选择续作视频", description: "新视频将基于此视频继续生成", type: "success" })
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

  const filteredTasks = tasks.filter((task) => {
    if (filterType === "all") return true
    return task.category === filterType
  })

  const successfulImageTasks = tasks.filter(
    (t) => t.category === "image" && t.status === "succeeded" && t.result_filepath,
  )

  const successfulVideoTasks = tasks.filter((t) => t.category === "video" && t.status === "succeeded" && t.sora2_pid)

  const ImageGenerateForm = () => (
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
            {IMAGE_MODELS.map((m) => (
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
            {IMAGE_ASPECT_RATIOS.map((ar) => (
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

      <Button className="w-full" onClick={handleGenerateImage} disabled={isGenerating}>
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

  const VideoGenerateForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="videoPrompt">提示词</Label>
        <Textarea
          id="videoPrompt"
          placeholder="描述您想要生成的视频..."
          value={videoPrompt}
          onChange={(e) => setVideoPrompt(e.target.value)}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>参考图片（可选）</Label>
        {videoFilepath ? (
          <div className="relative rounded-lg border p-2">
            <div className="flex items-center gap-2">
              <ImageWithAuth filepath={videoFilepath} alt="参考图" className="h-16 w-16 rounded object-cover" />
              <div className="flex-1 truncate text-sm">{videoFilepath.split("/").pop()}</div>
              <Button variant="ghost" size="sm" onClick={() => setVideoFilepath("")}>
                移除
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <ReferenceImageUpload
              filepaths={videoFilepath ? [videoFilepath] : []}
              onFilepathsChange={(paths) => setVideoFilepath(paths[0] || "")}
              maxFiles={1}
            />
            {successfulImageTasks.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">或选择已生成的图片：</p>
                <div className="grid grid-cols-4 gap-2">
                  {successfulImageTasks.slice(0, 8).map((task) => (
                    <button
                      key={task.id}
                      onClick={() => setVideoFilepath(task.result_filepath!)}
                      className="relative aspect-square overflow-hidden rounded border hover:ring-2 hover:ring-primary"
                    >
                      <ImageWithAuth
                        filepath={task.result_filepath!}
                        alt={task.prompt}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {successfulVideoTasks.length > 0 && (
        <div className="space-y-2">
          <Label>续作视频（可选）</Label>
          {remixTargetID ? (
            <div className="flex items-center justify-between rounded-lg border p-2">
              <span className="truncate text-sm">已选择: {remixTargetID}</span>
              <Button variant="ghost" size="sm" onClick={() => setRemixTargetID("")}>
                移除
              </Button>
            </div>
          ) : (
            <Select value={remixTargetID} onValueChange={setRemixTargetID}>
              <SelectTrigger>
                <SelectValue placeholder="选择一个视频作为前作" />
              </SelectTrigger>
              <SelectContent>
                {successfulVideoTasks.map((task) => (
                  <SelectItem key={task.id} value={task.sora2_pid!}>
                    <div className="truncate">{task.prompt.slice(0, 30)}...</div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <p className="text-xs text-muted-foreground">选择后新视频将作为该视频的续作</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="videoAspectRatio">比例</Label>
        <Select value={videoAspectRatio} onValueChange={(v) => setVideoAspectRatio(v as "16:9" | "9:16")}>
          <SelectTrigger id="videoAspectRatio">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VIDEO_ASPECT_RATIOS.map((ar) => (
              <SelectItem key={ar.value} value={ar.value}>
                {ar.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="videoDuration">时长</Label>
        <Select value={String(videoDuration)} onValueChange={(v) => setVideoDuration(Number(v) as 10 | 15)}>
          <SelectTrigger id="videoDuration">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VIDEO_DURATIONS.map((d) => (
              <SelectItem key={d.value} value={String(d.value)}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="videoSize">清晰度</Label>
        <Select value={videoSize} onValueChange={(v) => setVideoSize(v as "small" | "large")}>
          <SelectTrigger id="videoSize">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VIDEO_SIZES.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                <div>
                  <div>{size.label}</div>
                  <div className="text-xs text-muted-foreground">{size.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button className="w-full" onClick={handleGenerateVideo} disabled={isGenerating}>
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            生成中...
          </>
        ) : (
          <>
            <Video className="mr-2 h-4 w-4" />
            开始生成视频
          </>
        )}
      </Button>
    </div>
  )

  const GenerateForm = () => (
    <Tabs value={generateType} onValueChange={(v) => setGenerateType(v as "image" | "video")} className="w-full">
      <TabsList className="mb-4 grid w-full grid-cols-2">
        <TabsTrigger value="image" className="gap-2">
          <ImageIcon className="h-4 w-4" />
          图片
        </TabsTrigger>
        <TabsTrigger value="video" className="gap-2">
          <Video className="h-4 w-4" />
          视频
        </TabsTrigger>
      </TabsList>
      <TabsContent value="image">
        <ImageGenerateForm />
      </TabsContent>
      <TabsContent value="video">
        <VideoGenerateForm />
      </TabsContent>
    </Tabs>
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
                  创作中心
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
                创作中心
              </h2>
            </div>
            <GenerateForm />
          </div>
        </div>

        {/* Right Panel - Task List */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 md:mb-4">
            <h2 className="text-base font-semibold md:text-lg">生成记录</h2>
            <div className="flex items-center gap-2">
              <Select value={filterType} onValueChange={(v) => setFilterType(v as "all" | "image" | "video")}>
                <SelectTrigger className="h-8 w-24 bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="image">图片</SelectItem>
                  <SelectItem value="video">视频</SelectItem>
                </SelectContent>
              </Select>
              
              {/* 卡片大小选择器 */}
              <Select value={cardSize} onValueChange={(v) => setCardSize(v as "sm" | "md" | "lg")}>
                <SelectTrigger className="h-8 w-24 bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">小卡片</SelectItem>
                  <SelectItem value="md">中卡片</SelectItem>
                  <SelectItem value="lg">大卡片</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" className="h-8 bg-transparent" onClick={fetchTasks}>
                <RefreshCw className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                刷新
              </Button>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 md:py-12">
                <div className="mb-4 rounded-full bg-muted p-3 md:p-4">
                  <Film className="h-6 w-6 text-muted-foreground md:h-8 md:w-8" />
                </div>
                <h3 className="mb-2 text-base font-medium md:text-lg">暂无生成记录</h3>
                <p className="text-xs text-muted-foreground md:text-sm">
                  <span className="hidden md:inline">在左侧</span>
                  <span className="md:hidden">点击上方生成按钮</span>选择图片或视频，开始您的创作
                </p>
              </CardContent>
            </Card>
          ) : (
            // 根据卡片大小设置不同的网格列数
            <div className={
              cardSize === "sm" 
                ? "grid grid-cols-3 gap-2 md:gap-3 lg:grid-cols-4 xl:grid-cols-6" 
                : cardSize === "md" 
                  ? "grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3" 
                  : "grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2"
            }>
              {filteredTasks.map((task) => (
                <Card key={task.id} className="overflow-hidden">
                  <div className={
                    cardSize === "sm" 
                      ? "aspect-square bg-muted" 
                      : cardSize === "md" 
                        ? "aspect-square bg-muted" 
                        : "aspect-square bg-muted"
                  }>
                    {task.status === "succeeded" && task.result_filepath ? (
                      task.category === "video" ? (
                        <VideoWithAuth filepath={task.result_filepath} className="h-full w-full object-cover" />
                      ) : (
                        <ImageWithAuth
                          filepath={task.result_filepath}
                          alt={task.prompt}
                          className="h-full w-full object-cover"
                        />
                      )
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {getStatusBadge(task.status)}
                        <Badge variant="outline" className="gap-1">
                          {task.category === "video" ? (
                            <>
                              <Video className="h-2.5 w-2.5" />
                              视频
                            </>
                          ) : (
                            <>
                              <ImageIcon className="h-2.5 w-2.5" />
                              图片
                            </>
                          )}
                        </Badge>
                      </div>
                      {/* 移除了原来的下载图标按钮 */}
                    </div>
                    <p className="mb-2 line-clamp-2 text-xs md:text-sm" title={task.prompt}>
                      {task.prompt}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground md:text-xs">
                      <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                      {formatTime(task.create_at)}
                    </div>
                    {task.status === "failed" && task.failure_reason && (
                      <p className="mt-2 text-[10px] text-destructive md:text-xs">{task.error}</p>
                    )}
                    {task.status === "succeeded" && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {task.category === "image" && task.result_filepath && (
                          <Button
                            variant="outline"
                            size="sm"
                            className={`h-6 text-[10px] md:h-7 ${
                              cardSize === "sm" ? "text-[8px] px-1" : "md:text-xs"
                            } bg-transparent`}
                            onClick={() => handleUseAsVideoReference(task.result_filepath!)}
                          >
                            <Play className="mr-1 h-3 w-3" />
                            生成视频
                          </Button>
                        )}
                        {task.category === "video" && task.sora2_pid && (
                          <Button
                            variant="outline"
                            size="sm"
                            className={`h-6 text-[10px] md:h-7 ${
                              cardSize === "sm" ? "text-[8px] px-1" : "md:text-xs"
                            } bg-transparent`}
                            onClick={() => handleUseAsVideoSequel(task.sora2_pid!)}
                          >
                            <Film className="mr-1 h-3 w-3" />
                            生成续作
                          </Button>
                        )}
                        {/* 添加下载按钮 */}
                        {task.result_filepath && (
                          <Button
                            variant="outline"
                            size="sm"
                            className={`h-6 text-[10px] md:h-7 ${
                              cardSize === "sm" ? "text-[8px] px-1" : "md:text-xs"
                            } bg-transparent`}
                            onClick={() =>
                              handleDownload(
                                task.result_filepath!,
                                `${task.category}-${task.id}.${task.category === "video" ? "mp4" : "png"}`,
                                task.category === "video",
                              )
                            }
                          >
                            <Download className="mr-1 h-3 w-3" />
                            下载
                          </Button>
                        )}
                      </div>
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
