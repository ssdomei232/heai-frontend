"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Zap, ImageIcon, Palette, ArrowRight, Check } from "lucide-react"

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">HentropyAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.push("/login")}>
              登录
            </Button>
            <Button onClick={() => router.push("/register")}>
              免费注册
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            AI 驱动的创意平台
          </div>
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            用 AI 释放你的
            <span className="text-primary">创意潜能</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-muted-foreground">
            HentropyAI 是一个强大的 AI 图片生成平台，只需输入文字描述，即可在几秒钟内生成精美图片。 支持参考图片上传，让
            AI 更好地理解您的创意。
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" onClick={() => router.push("/register")}>
              开始创作
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push("/login")}>
              已有账号？登录
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-y bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">强大功能</h2>
            <p className="text-muted-foreground">简单易用，功能强大，让创作变得轻松</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="border-0 bg-background">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">积分消耗</h2>
            <p className="text-muted-foreground">按需使用，灵活选择适合您的生成模式</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {PRICING.map((plan) => (
              <Card key={plan.name} className="relative overflow-hidden">
                <CardContent className="pt-6">
                  <h3 className="mb-2 text-lg font-semibold">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-primary">{plan.points}</span>
                    <span className="text-muted-foreground"> 积分/张</span>
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">{plan.description}</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      高质量图片输出
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      支持多种比例
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      参考图片上传
                    </li>
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">准备好开始创作了吗？</h2>
          <p className="mb-8 text-muted-foreground">注册即可获得免费积分，立即体验 AI 创作的魅力</p>
          <Button size="lg" onClick={() => router.push("/register")}>
            免费注册，开始创作
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} HentropyAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
