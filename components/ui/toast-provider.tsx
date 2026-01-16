"use client"

import { createContext, useContext, useState, type ReactNode, useCallback } from "react"
import { X } from "lucide-react"

interface Toast {
  id: string
  title: string
  description?: string
  type: "success" | "error" | "info"
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])

    // 自动移除
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast 容器 */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-right-full ${
              toast.type === "error"
                ? "border-red-200 bg-red-50 text-red-900"
                : toast.type === "success"
                  ? "border-green-200 bg-green-50 text-green-900"
                  : "border-border bg-card text-card-foreground"
            }`}
          >
            <div className="flex-1">
              <p className="font-medium">{toast.title}</p>
              {toast.description && <p className="mt-1 text-sm opacity-80">{toast.description}</p>}
            </div>
            <button onClick={() => removeToast(toast.id)} className="opacity-60 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
