"use client"

import { Clock, Users, Briefcase, RotateCcw, Menu, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/hooks/use-auth"
import { toast } from "sonner"

const navigation = [
  { name: "Daily Log", href: "/log", icon: Clock },
  { name: "Clients", href: "/clients", icon: Briefcase },
  { name: "Team", href: "/team", icon: Users },
  { name: "Recurring", href: "/recurring", icon: RotateCcw },
]

export function Navigation() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error("Failed to sign out")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
              <Clock className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">
                Four Minute Log
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname === item.href
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <Clock className="h-6 w-6" />
                <span className="font-bold">Four Minute Log</span>
              </Link>
              <nav className="mt-8 flex flex-col space-y-3">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 text-sm font-medium",
                      pathname === item.href
                        ? "text-foreground"
                        : "text-foreground/60"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  className="justify-start px-2"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Sign Out</span>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="hidden md:flex"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </header>
  )
}