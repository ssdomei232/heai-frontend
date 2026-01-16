"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, Coins, LogOut } from "lucide-react"

export default function ProfilePage() {
  const { user, logout } = useAuth()

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">个人信息</h1>
        <p className="text-muted-foreground">管理您的账户信息</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>您的账户基本资料</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatar_url || "/placeholder.svg"} alt={user?.username} />
                <AvatarFallback className="text-2xl">{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{user?.username}</h3>
                <Badge variant="secondary">UID: {user?.uid}</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">用户名</p>
                  <p className="font-medium">{user?.username || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">邮箱</p>
                  <p className="font-medium">{user?.email || "未设置"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">注册时间</p>
                  <p className="font-medium">{user?.create_at ? formatDate(user.create_at) : "-"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card>
          <CardHeader>
            <CardTitle>账户状态</CardTitle>
            <CardDescription>您的积分和使用情况</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                <Coins className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">可用积分</p>
                <p className="text-3xl font-bold">{user?.point || 0}</p>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="mb-2 font-medium">积分说明</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 每次图片生成消耗一定积分</li>
                <li>• 不同模型消耗积分不同</li>
                <li>• 快速模式消耗最少</li>
                <li>• 专业模式消耗最多</li>
              </ul>
            </div>

            <Button variant="destructive" className="w-full" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              退出登录
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
