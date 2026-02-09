"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Zap, ImageIcon, Palette, ArrowRight, Check, Menu, Github } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

const FEATURES = [
  {
    icon: ImageIcon,
    title: "素材管理",
    description: "集中管理所有AIGC生成的素材",
  },
  {
    icon: Zap,
    title: "智能搜索",
    description: "通过关键词快速找到您需要的素材资源",
  },
  {
    icon: Palette,
    title: "简单易用",
    description: "界面简洁直观，无需复杂学习即可快速上手",
  },
]

export default function LandingPage() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header - 移动端优化 */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:h-16">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary md:h-8 md:w-8">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground md:h-4 md:w-4" />
            </div>
            <span className="text-base font-bold md:text-lg">HEAI</span>
          </div>

          {/* 桌面端导航 */}
          <div className="hidden items-center gap-3 sm:flex">
            <Button variant="ghost" onClick={() => router.push("/login")}>
              登录
            </Button>
            <Button onClick={() => router.push("/register")}>
              免费注册
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="sm:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 pt-8">
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => {
                    router.push("/login")
                    setMobileMenuOpen(false)
                  }}
                >
                  登录
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    router.push("/register")
                    setMobileMenuOpen(false)
                  }}
                >
                  免费注册
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Hero Section - 移动端优化 */}
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs md:mb-4 md:px-4 md:py-1.5 md:text-sm">
            <Github className="h-3.5 w-3.5 text-primary md:h-4 md:w-4" />
            开源项目
          </div>
          <h1 className="mb-4 text-balance text-2xl font-bold tracking-tight sm:text-3xl md:mb-6 md:text-4xl lg:text-5xl xl:text-6xl">
            开源的<span className="text-primary">AIGC素材管理</span>工具
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-pretty text-sm text-muted-foreground md:mb-8 md:text-base lg:text-lg">
            HEAI是一个功能强大的AIGC素材管理平台，帮助您高效组织、检索和利用AI生成的内容。支持多种文件格式，提供智能标签和分类系统。
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:gap-4">
            <Button size="lg" onClick={() => router.push("/register")} className="w-full sm:w-auto">
              开始使用
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.open('https://github.com/ssdomei232/heai-backend', '_blank')}>
              <Github className="mr-2 h-4 w-4" />
              访问GitHub
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section - 移动端优化 */}
      <section className="border-y bg-muted/30 py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 text-center md:mb-12">
            <h2 className="mb-2 text-xl font-bold md:mb-4 md:text-2xl lg:text-3xl">核心功能</h2>
            <p className="text-xs text-muted-foreground md:text-sm lg:text-base">简单易用，功能强大，让素材管理变得轻松</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="border-0 bg-background">
                <CardContent className="p-4 md:pt-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 md:mb-4 md:h-12 md:w-12">
                    <feature.icon className="h-5 w-5 text-primary md:h-6 md:w-6" />
                  </div>
                  <h3 className="mb-1.5 text-base font-semibold md:mb-2 md:text-lg">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground md:text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - 移动端优化 */}
      <section className="border-t bg-muted/30 py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="mb-2 text-xl font-bold md:mb-4 md:text-2xl lg:text-3xl">加入开源社区</h2>
          <p className="mb-6 text-xs text-muted-foreground md:mb-8 md:text-sm lg:text-base">
            立即访问我们的GitHub仓库，参与项目开发或体验Demo
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:gap-4">
            <Button size="lg" onClick={() => router.push("/register")} className="w-full sm:w-auto">
              创建账户，体验Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => window.open('https://github.com/ssdomei232/heai-backend', '_blank')}
              className="w-full sm:w-auto"
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub仓库
            </Button>
          </div>
        </div>
      </section>

      {/* Footer - 移动端优化 */}
      <footer className="border-t py-6 md:py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-muted-foreground md:text-sm">
          <p>&copy; {new Date().getFullYear()} HEAI. 开源AIGC素材管理工具</p>
          <p className="mt-1">
            <Button 
              variant="link" 
              onClick={() => window.open('https://github.com/ssdomei232/heai-backend', '_blank')}
              className="h-auto p-0 text-xs text-muted-foreground md:text-sm"
            >
              <Github className="mr-1 h-3 w-3" />
              Github
            </Button>
          </p>
        </div>
      </footer>
    </div>
  )
}