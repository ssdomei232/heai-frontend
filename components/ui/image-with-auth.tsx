"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { fileApi } from "@/lib/api"
import { Loader2, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageWithAuthProps {
  filepath: string
  alt: string
  className?: string
  fallback?: React.ReactNode
}

// 用于需要携带 cookie 获取图片的组件
export function ImageWithAuth({ filepath, alt, className, fallback }: ImageWithAuthProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let isMounted = true
    let objectUrl: string | null = null

    const loadImage = async () => {
      try {
        setIsLoading(true)
        setError(false)
        const url = await fileApi.fetchImage(filepath)
        objectUrl = url
        if (isMounted) {
          setImageSrc(url)
        }
      } catch {
        if (isMounted) {
          setError(true)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    if (filepath) {
      loadImage()
    }

    return () => {
      isMounted = false
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [filepath])

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center bg-muted", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !imageSrc) {
    return (
      fallback || (
        <div className={cn("flex items-center justify-center bg-muted", className)}>
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        </div>
      )
    )
  }

  return <img src={imageSrc || "/placeholder.svg"} alt={alt} className={className} />
}
