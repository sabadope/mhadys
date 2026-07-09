// Root route ("/") — explicitly renders ONLY the landing page.
// All landing content (Navbar + Hero) lives in components/landing.tsx.
// Nothing else is rendered here, so `npm run dev` shows only the landing.
import { Landing } from "@/components/landing"

export default function Home() {
  return (
    <main className="relative flex flex-1 items-center justify-center w-full h-full px-4 py-12">
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

      <div className="w-full max-w-2xl animate-in">
        <Landing />
      </div>
    </main>
  )
}
