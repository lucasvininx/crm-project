"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Link
        href="/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Dashboard
      </Link>
      <Link
        href="/customers"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.startsWith("/customers") ? "text-primary" : "text-muted-foreground",
        )}
      >
        Clientes
      </Link>
      <Link
        href="/deals"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.startsWith("/deals") ? "text-primary" : "text-muted-foreground",
        )}
      >
        Negócios
      </Link>
      <Link
        href="/tasks"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.startsWith("/tasks") ? "text-primary" : "text-muted-foreground",
        )}
      >
        Tarefas
      </Link>
    </nav>
  )
}
