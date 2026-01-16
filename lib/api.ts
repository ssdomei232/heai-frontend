// API 基础配置和请求封装
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

// 存储 CSRF Token
let csrfToken: string | null = null

// 获取 CSRF Token
export async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken

  const response = await fetch(`${API_BASE_URL}/v1/csrf-token`, {
    method: "GET",
    credentials: "include",
  })

  const data = await response.json()
  if (data.code === 200) {
    csrfToken = data.data
    return csrfToken
  }
  throw new Error("获取 CSRF Token 失败")
}

// 清除 CSRF Token（登出时调用）
export function clearCsrfToken() {
  csrfToken = null
}

// 通用请求函数（需要 CSRF Token）
async function fetchWithCsrf(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getCsrfToken()

  const headers = new Headers(options.headers)
  headers.set("X-CSRF-Token", token)
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: "include",
  })
}

// 通用请求函数（不需要 CSRF Token）
async function fetchWithoutCsrf(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers)
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: "include",
  })
}

// 用户相关 API
export const userApi = {
  // 登录（不需要 CSRF Token）
  login: async (username: string, password: string) => {
    const response = await fetchWithoutCsrf("/v1/user/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
    return response.json()
  },

  // 注册（不需要 CSRF Token）
  register: async (username: string, password: string) => {
    const response = await fetchWithoutCsrf("/v1/user/registry", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
    return response.json()
  },

  // 获取用户信息
  getInfo: async () => {
    const response = await fetchWithoutCsrf("/v1/user/info", {
      method: "GET",
    })
    return response.json()
  },
}

// 项目相关 API
export const projectApi = {
  // 获取所有项目
  getAll: async () => {
    const response = await fetchWithoutCsrf("/v1/project", {
      method: "GET",
    })
    return response.json()
  },

  // 创建项目（需要 CSRF Token）
  create: async (title: string) => {
    const response = await fetchWithCsrf("/v1/project", {
      method: "POST",
      body: JSON.stringify({ title }),
    })
    return response.json()
  },

  // 获取项目下的任务
  getTasks: async (projectId: number) => {
    const response = await fetchWithoutCsrf(`/v1/project/${projectId}`, {
      method: "GET",
    })
    return response.json()
  },

  // 删除项目（需要 CSRF Token）
  delete: async (projectId: number) => {
    const response = await fetchWithCsrf(`/v1/project/${projectId}`, {
      method: "DELETE",
    })
    return response.json()
  },
}

// 生成相关 API
export const generateApi = {
  // 生成图片（需要 CSRF Token）
  image: async (params: {
    prompt: string
    model: "nano-banana" | "nano-banana-pro" | "nano-banana-fast"
    aspectRatio: string
    imageSize?: "1K" | "2K" | "4K"
    filepaths: string[]
    project_id: number
  }) => {
    const response = await fetchWithCsrf("/v1/generate/image", {
      method: "POST",
      body: JSON.stringify(params),
    })
    return response.json()
  },
}

// 文件相关 API
export const fileApi = {
  // 上传文件（需要 CSRF Token）
  upload: async (file: File) => {
    const token = await getCsrfToken()
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${API_BASE_URL}/v1/upload`, {
      method: "POST",
      headers: {
        "X-CSRF-Token": token,
      },
      credentials: "include",
      body: formData,
    })
    return response.json()
  },

  // 获取所有上传的图片
  getAll: async () => {
    const response = await fetchWithoutCsrf("/v1/upload", {
      method: "GET",
    })
    return response.json()
  },

  getUrl: (filepath: string) => {
    return `${API_BASE_URL}/v1/file?f=${encodeURIComponent(filepath)}`
  },

  fetchImage: async (filepath: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/v1/file?f=${encodeURIComponent(filepath)}`, {
      method: "GET",
      credentials: "include",
    })
    if (!response.ok) {
      throw new Error("获取图片失败")
    }
    const blob = await response.blob()
    return URL.createObjectURL(blob)
  },
}

// 类型定义
export interface User {
  uid: number
  username: string
  point: number
  avatar_url: string
  email: string
  create_at: number
  name?: string
  qq?: string
}

export interface Project {
  id: number
  create_at: number
  title: string
}

export interface Task {
  id: number
  create_at: number
  finish_at: number | null
  model: string
  prompt: string
  reference_image_filepaths: string
  category: string
  result_filepath: string
  status: "running" | "succeeded" | "failed"
  failure_reason: string | null
  error: string | null
}
