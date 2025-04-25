"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="border-b-4 border-black bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-black font-comic">
            Simulation.io
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-black">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
            <ul className="flex space-x-8">
              <li>
                <Link
                  href="/"
                  className="text-black hover:text-gray-700 font-jetbrains border-b-2 border-transparent hover:border-black transition-colors hover-pop hover-text-blue"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/simulations"
                  className="text-black hover:text-gray-700 font-jetbrains border-b-2 border-transparent hover:border-black transition-colors hover-pop hover-text-green"
                >
                  Simulations
                </Link>
              </li>
            </ul>
          </nav>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/auth/login">
              <Button
                variant="outline"
                className="border-black text-black hover:bg-gray-100 font-jetbrains hover-pop hover-purple"
              >
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-black text-white hover:bg-gray-800 font-jetbrains hover-pop hover-blue">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-black">
            <ul className="space-y-4">
              <li>
                <Link
                  href="/"
                  className="block text-black font-jetbrains hover-text-blue"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/simulations"
                  className="block text-black font-jetbrains hover-text-green"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Simulations
                </Link>
              </li>
              <li className="pt-4 border-t border-gray-200">
                <Link
                  href="/auth/login"
                  className="block text-black font-jetbrains hover-text-purple"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/signup"
                  className="block text-black font-jetbrains hover-text-blue"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  )
}
