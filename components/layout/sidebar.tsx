"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Home, FolderOpen, User, LogOut, Sparkles, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/projects", label: "项目管理", icon: FolderOpen },
  { href: "/gallery", label: "我的图库", icon: ImageIcon },
  { href: "/profile", label: "个人信息", icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn("flex h-screen flex-col border-r bg-card transition-all duration-300", collapsed ? "w-16" : "w-64")}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">HentropyAI</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                collapsed && "justify-center px-2",
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="border-t p-4">
        {user ? (
          <div className={cn("flex items-center gap-3", collapsed && "flex-col")}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.username} />
              <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{user.username}</p>
                <p className="text-xs text-muted-foreground">{user.point} 积分</p>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={logout} title="退出登录" className={cn(collapsed && "mt-2")}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className={cn("flex gap-2", collapsed && "flex-col")}>
            <Link href="/login" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent" size={collapsed ? "icon" : "default"}>
                {collapsed ? <User className="h-4 w-4" /> : "登录"}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}
