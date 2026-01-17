"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { fileApi } from "@/lib/api"
import { Loader2, Video } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoWithAuthProps {
  filepath: string
  className?: string
  fallback?: React.ReactNode
  controls?: boolean
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
}

// 用于需要携带 cookie 获取视频的组件
export function VideoWithAuth({
  filepath,
  className,
  fallback,
  controls = true,
  autoPlay = false,
  loop = false,
  muted = true,
}: VideoWithAuthProps) {
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let isMounted = true
    let objectUrl: string | null = null

    const loadVideo = async () => {
      try {
        setIsLoading(true)
        setError(false)
        const url = await fileApi.fetchVideo(filepath)
        objectUrl = url
        if (isMounted) {
          setVideoSrc(url)
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
      loadVideo()
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

  if (error || !videoSrc) {
    return (
      fallback || (
        <div className={cn("flex items-center justify-center bg-muted", className)}>
          <Video className="h-6 w-6 text-muted-foreground" />
        </div>
      )
    )
  }

  return (
    <video
      ref={videoRef}
      src={videoSrc}
      className={className}
      controls={controls}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline
    />
  )
}
