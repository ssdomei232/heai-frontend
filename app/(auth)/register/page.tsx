"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/components/ui/toast-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles } from "lucide-react"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { register, login, isAuthenticated, isLoading: authLoading } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/projects")
    }
  }, [authLoading, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password || !confirmPassword) {
      showToast({ title: "请填写所有字段", type: "error" })
      return
    }

    if (password !== confirmPassword) {
      showToast({ title: "两次输入的密码不一致", type: "error" })
      return
    }

    if (password.length < 6) {
      showToast({ title: "密码长度至少为6位", type: "error" })
      return
    }

    setIsLoading(true)
    const result = await register(username, password)

    if (result.success) {
      showToast({ title: "注册成功", description: "正在自动登录...", type: "success" })
      const loginResult = await login(username, password)
      setIsLoading(false)
      if (loginResult.success) {
        router.push("/projects")
      } else {
        router.push("/login")
      }
    } else {
      setIsLoading(false)
      showToast({ title: "注册失败", description: result.message, type: "error" })
    }
  }

  if (authLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary md:mb-4 md:h-12 md:w-12">
            <Sparkles className="h-5 w-5 text-primary-foreground md:h-6 md:w-6" />
          </div>
          <CardTitle className="text-xl md:text-2xl">创建账户</CardTitle>
          <CardDescription className="text-xs md:text-sm">注册 HentropyAI 开始您的创作之旅</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3 md:space-y-4">
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="username" className="text-sm">
                用户名
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="h-10 md:h-11"
              />
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="password" className="text-sm">
                密码
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码（至少6位）"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-10 md:h-11"
              />
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm">
                确认密码
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="h-10 md:h-11"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 md:gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              注册
            </Button>
            <p className="text-center text-xs text-muted-foreground md:text-sm">
              已有账户？{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                立即登录
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
