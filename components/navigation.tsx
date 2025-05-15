"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

interface NavigationProps {
  user: { id: number; username: string } | null
  onSignOut?: () => void
}

export function Navigation({ user, onSignOut }: NavigationProps) {
  const pathname = usePathname()

  return (
    <nav className="backdrop-blur-sm bg-white/30 border-b border-gray-100 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500"
        >
          MedTerms
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex gap-4">
              <NavLink href="/" current={pathname === "/"}>
                Translator
              </NavLink>
              <NavLink href="/dashboard" current={pathname === "/dashboard"}>
                History
              </NavLink>
              <NavLink href="/subscription" current={pathname === "/subscription"}>
                Subscription
              </NavLink>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden sm:inline">{user.username}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={onSignOut}
                className="bg-white/50 backdrop-blur-sm hover:bg-white/70"
              >
                Sign Out
              </Button>
            </div>
          </div>
        ) : (
          <Button asChild className="bg-gradient-to-r from-teal-400 to-cyan-500 text-white">
            <Link href="/">Sign In</Link>
          </Button>
        )}
      </div>
    </nav>
  )
}

interface NavLinkProps {
  href: string
  current: boolean
  children: React.ReactNode
}

function NavLink({ href, current, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        current
          ? "bg-gradient-to-r from-teal-400/10 to-cyan-500/10 text-teal-600"
          : "text-gray-600 hover:text-teal-600 hover:bg-white/50"
      }`}
    >
      {children}
    </Link>
  )
}
