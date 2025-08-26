"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme, themes } from "@/contexts/ThemeContext"
import { useSidebar } from "@/contexts/SidebarContext"

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "🏠",
  },
  {
    name: "Students",
    href: "/dashboard/students",
    icon: "👥",
  },
  {
    name: "Fees Structure",
    href: "/dashboard/fees-structure",
    icon: "💰",
  },
  {
    name: "Payments",
    href: "/dashboard/payments",
    icon: "💳",
  },
  {
    name: "Balances",
    href: "/dashboard/balances",
    icon: "⚖️",
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: "📊",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: "⚙️",
  },
]

export default function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const { collapsed, setCollapsed } = useSidebar()
  
  // Always call useTheme hook, but handle the case where it might not be available
  let themeContext;
  try {
    themeContext = useTheme();
  } catch (error) {
    console.warn('Theme context not available in sidebar');
  }
  
  // Safe theme access with fallback
  const currentTheme = themes[themeContext?.theme || 'cyan'] || themes.cyan;

  return (
    <div className={`fixed left-0 top-0 h-full bg-white/95 backdrop-blur-md shadow-2xl border-r border-gray-200/50 ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out z-50`}>
      <div className="flex flex-col h-full">
        {/* Enhanced Header */}
        <div className={`flex items-center justify-between p-4 border-b border-gray-200/50 bg-gradient-to-r ${currentTheme.floating.primary.replace('bg-', 'from-').replace('/15', '-50')} ${currentTheme.floating.secondary.replace('bg-', 'to-').replace('/20', '-50')} backdrop-blur-sm`}>
          {!collapsed && (
            <h1 className="text-lg font-bold text-gray-900 drop-shadow-sm">
              Rodrise School
            </h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`p-2.5 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 ${
              collapsed 
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-xl' 
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-md hover:shadow-lg'
            }`}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Enhanced Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                      isActive
                        ? `bg-gradient-to-r ${currentTheme.secondary} text-white shadow-lg transform scale-105 ring-2 ring-white/20`
                        : `text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-white/80 hover:to-gray-50/80 hover:shadow-md hover:scale-105`
                    }`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full shadow-sm`} />
                    )}
                    
                    <span className={`mr-3 text-lg transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'drop-shadow-sm' : ''
                    }`}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className="font-semibold">{item.name}</span>
                    )}
                    
                    {/* Hover effect */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Enhanced User Info */}
        <div className="p-4 border-t border-gray-200/50 bg-gradient-to-t from-gray-50/50 to-transparent">
          {!collapsed && (
            <div className="flex items-center mb-4 p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm border border-gray-200/30">
              <div className="flex-shrink-0 h-10 w-10">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-bold">
                    {session?.user?.name?.charAt(0) || "U"}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  School Admin
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut()}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
              collapsed 
                ? 'justify-center bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg hover:shadow-xl' 
                : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 hover:from-red-100 hover:to-pink-100 hover:shadow-md border border-red-200/50'
            }`}
            title={collapsed ? "Sign Out" : ""}
          >
            <span className={`text-lg ${collapsed ? 'mr-0' : 'mr-3'}`}>🚪</span>
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </div>
    </div>
  )
}

