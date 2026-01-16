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
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl font-bold md:text-2xl">个人信息</h1>
        <p className="text-xs text-muted-foreground md:text-sm">管理您的账户信息</p>
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">基本信息</CardTitle>
            <CardDescription className="text-xs md:text-sm">您的账户基本资料</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:space-y-6 md:p-6 md:pt-0">
            <div className="flex items-center gap-3 md:gap-4">
              <Avatar className="h-16 w-16 md:h-20 md:w-20">
                <AvatarImage src={user?.avatar_url || "/placeholder.svg"} alt={user?.username} />
                <AvatarFallback className="text-xl md:text-2xl">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold md:text-xl">{user?.username}</h3>
                <Badge variant="secondary">UID: {user?.uid}</Badge>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 md:h-10 md:w-10">
                  <User className="h-4 w-4 text-primary md:h-5 md:w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground md:text-sm">用户名</p>
                  <p className="text-sm font-medium md:text-base">{user?.username || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 md:h-10 md:w-10">
                  <Mail className="h-4 w-4 text-primary md:h-5 md:w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground md:text-sm">邮箱</p>
                  <p className="text-sm font-medium md:text-base">{user?.email || "未设置"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 md:h-10 md:w-10">
                  <Calendar className="h-4 w-4 text-primary md:h-5 md:w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground md:text-sm">注册时间</p>
                  <p className="text-sm font-medium md:text-base">
                    {user?.create_at ? formatDate(user.create_at) : "-"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">账户状态</CardTitle>
            <CardDescription className="text-xs md:text-sm">您的积分和使用情况</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:space-y-6 md:p-6 md:pt-0">
            <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-3 md:gap-4 md:p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary md:h-12 md:w-12">
                <Coins className="h-5 w-5 text-primary-foreground md:h-6 md:w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground md:text-sm">可用积分</p>
                <p className="text-2xl font-bold md:text-3xl">{user?.point || 0}</p>
              </div>
            </div>

            <div className="rounded-lg border p-3 md:p-4">
              <h4 className="mb-2 text-sm font-medium md:text-base">积分说明</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground md:space-y-2 md:text-sm">
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
