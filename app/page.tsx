"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Zap, ImageIcon, Palette, ArrowRight, Check, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

const FEATURES = [
  {
    icon: Zap,
    title: "快速生成",
    description: "使用先进的 AI 模型，几秒钟内生成高质量图片",
  },
  {
    icon: Palette,
    title: "多种风格",
    description: "支持各种艺术风格，从写实到抽象，满足不同创作需求",
  },
  {
    icon: ImageIcon,
    title: "参考图生成",
    description: "上传参考图片，AI 将基于您的风格进行创作",
  },
]

const PRICING = [
  {
    name: "快速模式",
    points: 10,
    description: "速度最快，适合快速预览",
  },
  {
    name: "标准模式",
    points: 20,
    description: "平衡速度与质量",
  },
  {
    name: "专业模式",
    points: 50,
    description: "最高质量，适合最终出图",
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
            <span className="text-base font-bold md:text-lg">HentropyAI</span>
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
            <Sparkles className="h-3.5 w-3.5 text-primary md:h-4 md:w-4" />
            AI 驱动的创意平台
          </div>
          <h1 className="mb-4 text-balance text-2xl font-bold tracking-tight sm:text-3xl md:mb-6 md:text-4xl lg:text-5xl xl:text-6xl">
            用 AI 释放你的
            <span className="text-primary">创意潜能</span>
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-pretty text-sm text-muted-foreground md:mb-8 md:text-base lg:text-lg">
            HentropyAI 是一个强大的 AI 图片生成平台，只需输入文字描述，即可在几秒钟内生成精美图片。支持参考图片上传，让
            AI 更好地理解您的创意。
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:gap-4">
            <Button size="lg" onClick={() => router.push("/register")} className="w-full sm:w-auto">
              开始创作
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push("/login")} className="w-full sm:w-auto">
              已有账号？登录
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section - 移动端优化 */}
      <section className="border-y bg-muted/30 py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 text-center md:mb-12">
            <h2 className="mb-2 text-xl font-bold md:mb-4 md:text-2xl lg:text-3xl">强大功能</h2>
            <p className="text-xs text-muted-foreground md:text-sm lg:text-base">简单易用，功能强大，让创作变得轻松</p>
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

      {/* Pricing Section - 移动端优化 */}
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 text-center md:mb-12">
            <h2 className="mb-2 text-xl font-bold md:mb-4 md:text-2xl lg:text-3xl">积分消耗</h2>
            <p className="text-xs text-muted-foreground md:text-sm lg:text-base">按需使用，灵活选择适合您的生成模式</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
            {PRICING.map((plan) => (
              <Card key={plan.name} className="relative overflow-hidden">
                <CardContent className="p-4 md:pt-6">
                  <h3 className="mb-1.5 text-base font-semibold md:mb-2 md:text-lg">{plan.name}</h3>
                  <div className="mb-3 md:mb-4">
                    <span className="text-2xl font-bold text-primary md:text-3xl">{plan.points}</span>
                    <span className="text-xs text-muted-foreground md:text-sm"> 积分/张</span>
                  </div>
                  <p className="mb-3 text-xs text-muted-foreground md:mb-4 md:text-sm">{plan.description}</p>
                  <ul className="space-y-1.5 text-xs md:space-y-2 md:text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary md:h-4 md:w-4" />
                      高质量图片输出
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary md:h-4 md:w-4" />
                      支持多种比例
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary md:h-4 md:w-4" />
                      参考图片上传
                    </li>
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - 移动端优化 */}
      <section className="border-t bg-muted/30 py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="mb-2 text-xl font-bold md:mb-4 md:text-2xl lg:text-3xl">准备好开始创作了吗？</h2>
          <p className="mb-6 text-xs text-muted-foreground md:mb-8 md:text-sm lg:text-base">
            注册即可获得免费积分，立即体验 AI 创作的魅力
          </p>
          <Button size="lg" onClick={() => router.push("/register")} className="w-full sm:w-auto">
            免费注册，开始创作
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer - 移动端优化 */}
      <footer className="border-t py-6 md:py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-muted-foreground md:text-sm">
          <p>&copy; {new Date().getFullYear()} HentropyAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
