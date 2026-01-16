"use client"

import type React from "react"

import { useState, useRef } from "react"
import { fileApi } from "@/lib/api"
import { useToast } from "@/components/ui/toast-provider"
import { ImageWithAuth } from "@/components/ui/image-with-auth"
import { Upload, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReferenceImageUploadProps {
  filepaths: string[]
  onFilepathsChange: (filepaths: string[]) => void
  maxFiles?: number
  className?: string
}

export function ReferenceImageUpload({
  filepaths,
  onFilepathsChange,
  maxFiles = 4,
  className,
}: ReferenceImageUploadProps) {
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (filepaths.length + files.length > maxFiles) {
      showToast({
        title: "超出限制",
        description: `最多上传 ${maxFiles} 张参考图片`,
        type: "error",
      })
      return
    }

    setIsUploading(true)
    const newFilepaths: string[] = []

    for (const file of Array.from(files)) {
      // 验证文件类型
      if (!file.type.startsWith("image/")) {
        showToast({
          title: "文件类型错误",
          description: `${file.name} 不是图片文件`,
          type: "error",
        })
        continue
      }

      // 验证文件大小 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast({
          title: "文件过大",
          description: `${file.name} 超过 10MB 限制`,
          type: "error",
        })
        continue
      }

      try {
        const response = await fileApi.upload(file)
        if (response.code === 200 && response.filePath) {
          newFilepaths.push(response.filePath)
        } else {
          showToast({
            title: "上传失败",
            description: response.data || "请稍后重试",
            type: "error",
          })
        }
      } catch {
        showToast({
          title: "上传失败",
          description: "网络错误，请稍后重试",
          type: "error",
        })
      }
    }

    if (newFilepaths.length > 0) {
      onFilepathsChange([...filepaths, ...newFilepaths])
      showToast({
        title: "上传成功",
        description: `已上传 ${newFilepaths.length} 张图片`,
        type: "success",
      })
    }

    setIsUploading(false)
    // 清空 input 以便重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemove = (index: number) => {
    const newFilepaths = filepaths.filter((_, i) => i !== index)
    onFilepathsChange(newFilepaths)
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* 已上传的图片预览 */}
      {filepaths.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {filepaths.map((filepath, index) => (
            <div key={filepath} className="group relative aspect-square overflow-hidden rounded-lg border">
              <ImageWithAuth filepath={filepath} alt={`参考图片 ${index + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 上传按钮 */}
      {filepaths.length < maxFiles && (
        <div
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors hover:border-primary hover:bg-muted/50",
            isUploading && "pointer-events-none opacity-50",
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="mb-2 h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">{isUploading ? "上传中..." : "点击上传参考图片"}</span>
          <span className="mt-1 text-xs text-muted-foreground">支持 JPG、PNG，最大 10MB，最多 {maxFiles} 张</span>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
    </div>
  )
}
