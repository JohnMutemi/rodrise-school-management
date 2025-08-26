"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Sidebar from "./sidebar"
import { useTheme, themes } from "@/contexts/ThemeContext"
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext"
import { ThemeSwitcher } from "@/components/ThemeSwitcher"

interface DashboardLayoutProps {
  children: React.ReactNode
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const { collapsed } = useSidebar()
  
  // Always call useTheme hook, but handle the case where it might not be available
  let themeContext;
  try {
    themeContext = useTheme();
  } catch (error) {
    console.warn('Theme context not available in dashboard layout');
  }
  
  // Safe theme access with fallback
  const currentTheme = themes[themeContext?.theme || 'cyan'] || themes.cyan;

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center" suppressHydrationWarning>
        <div className="text-lg" suppressHydrationWarning>Loading...</div>
      </div>
    )
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" suppressHydrationWarning>
        <div className="text-lg" suppressHydrationWarning>Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.primary}`} suppressHydrationWarning>
      <Sidebar />
      <main className={`transition-all duration-300 ease-in-out ${collapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  )
}





