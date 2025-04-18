"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Link from "next/link"
import type { LinkProps } from "next/link"
import { cn } from "@/lib/utils"

interface ActiveLinkProps extends LinkProps {
  children: React.ReactNode
  className?: string
  activeClassName?: string
  exact?: boolean
}

export function ActiveLink({
  children,
  className,
  activeClassName = "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
  exact = false,
  ...props
}: ActiveLinkProps) {
  const pathname = usePathname()
  const isActive = exact ? pathname === props.href : pathname.startsWith(props.href.toString())

  return (
    <Link className={cn(className, isActive && activeClassName)} {...props}>
      {children}
    </Link>
  )
}
