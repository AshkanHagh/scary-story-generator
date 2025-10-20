"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Button from "../ui/button"
import GenerateStoryFormModal from "../generate-story/generate-story-form-modal"
import { useState } from "react"

const NAVS: { title: string; href: string }[] = []

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <nav className="container flex justify-between items-center gap-3 p-3 border-b border-foreground/10 mx-auto">
      <ul className="flex gap-2 mx-auto">
        {NAVS.map((nav) => (
          <Nav href={nav.href} key={nav.href}>
            {nav.title}
          </Nav>
        ))}
      </ul>
      <Button onClick={() => setIsOpen(true)} variant={"outline"} size="sm">
        Generate Story
      </Button>
      <GenerateStoryFormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </nav>
  )
}

type NavProps = {
  children: React.ReactNode
  href: string
}

export const Nav = ({ children, href }: NavProps) => {
  const pathname = usePathname()
  const currentPath = pathname === href
  return (
    <li className={currentPath ? "text-primary" : ""}>
      <Link href={href}>{children}</Link>
    </li>
  )
}
