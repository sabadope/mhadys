"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

/**
 * Landing page for the web app — a focused, search-first layout.
 *
 * This is the only surface rendered by `app/page.tsx` on `npm run dev`,
 * so the landing (search layout) is shown first with nothing else.
 * It is fully self-contained (no section dependencies) so it can later be
 * reused for the mobile/APK build without touching the route.
 */
export function Landing() {
    return (
        <div className="flex flex-col w-full h-full">
            <main className="relative flex flex-1 items-center justify-center w-full h-full px-6 py-12 sm:px-8 sm:py-16 overflow-hidden">

                <div className="w-full max-w-2xl space-y-10 sm:space-y-12 text-center">
                    {/* Brand */}
                    <div className="space-y-4 animate-in animate-in-delay-1">
                        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl glass-text">
                            Mhadys
                        </h1>
                        <p className="text-lg text-muted-foreground sm:text-xl animate-in animate-in-delay-2">
                            Search anything, find everything.
                        </p>
                    </div>

                    {/* Search layout - wrapped in liquid glass */}
                    <form
                        className="glass-liquid glass-border-glow glass-reflection glass-wobble flex w-full items-center gap-3 animate-in animate-in-delay-2 p-3 sm:p-4 rounded-3xl"
                        onSubmit={(e) => e.preventDefault()}
                    >
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Type to search..."
                                aria-label="Search"
                                className="glass-input h-14 pl-12 text-base w-full border-0 bg-transparent"
                            />
                        </div>
                        <Button type="submit" className="glass-button glass-shimmer glass-droplet h-14 px-8 text-base">
                            Search
                        </Button>
                    </form>

                    {/* Suggestion chips */}
                    <div className="flex flex-wrap items-center justify-center gap-3 animate-in animate-in-delay-3">
                        {["Products", "Docs", "Pricing", "Support"].map((s) => (
                            <button
                                key={s}
                                type="button"
                                className="glass-chip glass-ripple rounded-full px-5 py-2 text-sm text-muted-foreground"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Landing
