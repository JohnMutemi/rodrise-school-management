"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

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
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`bg-white shadow-lg ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 min-h-screen`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {!collapsed && (
            <h1 className="text-lg font-semibold text-gray-900">
              Rodrise School
            </h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t">
          {!collapsed && (
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0 h-8 w-8">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-600 text-sm font-medium">
                    {session?.user?.name?.charAt(0) || "U"}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-500">
                  School Admin
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut()}
            className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
          >
            <span className="mr-3">🚪</span>
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </div>
    </div>
  )
}

