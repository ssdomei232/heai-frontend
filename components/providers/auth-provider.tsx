"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { type User, userApi, clearCsrfToken } from "@/lib/api"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (username: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const response = await userApi.getInfo()
      if (response.code === 200) {
        setUser(response.data)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      await refreshUser()
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await userApi.login(username, password)
      if (response.code === 200) {
        await refreshUser()
        return { success: true, message: response.data }
      }
      return { success: false, message: response.data || "登录失败" }
    } catch {
      return { success: false, message: "网络错误，请稍后重试" }
    }
  }

  const register = async (username: string, password: string) => {
    try {
      const response = await userApi.register(username, password)
      if (response.code === 200) {
        return { success: true, message: response.data }
      }
      return { success: false, message: response.data || "注册失败" }
    } catch {
      return { success: false, message: "网络错误，请稍后重试" }
    }
  }

  const logout = () => {
    clearCsrfToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
