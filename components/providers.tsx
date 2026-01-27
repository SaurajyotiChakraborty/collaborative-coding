"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { SessionProvider } from "next-auth/react"
import { SessionWatcher } from "./session-watcher"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <SessionWatcher />
            <NextThemesProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
            >
                <TooltipProvider>
                    {children}
                    <Toaster />
                </TooltipProvider>
            </NextThemesProvider>
        </SessionProvider>
    )
}
