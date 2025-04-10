import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white p-4">
      <div className="w-full max-w-4xl mx-auto text-center space-y-8">
        {/* Logo */}
        <div className="inline-flex items-center justify-center">
          <div className="h-12 w-40 rounded-lg bg-sky-500 flex items-center justify-center">
            <span className="text-white text-xl font-bold">GitTrack</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
          Analyze students' Git workflow and generate a report
        </h1>

        {/* App Images - Three images in a staggered arrangement */}
        <div className="mt-12 relative flex flex-col items-center px-4 py-8">
          {/* Top row with two tilted images */}
          <div className="flex justify-center items-center w-full">
            <div className="transform -rotate-6 transition-transform hover:-rotate-3 hover:scale-105 z-10">
              <div className="rounded-xl overflow-hidden border shadow-xl bg-white">
                <Image
                  src="/graph.png"
                  alt="image of commit graph"
                  width={1000}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </div>

            <div className="transform rotate-6 transition-transform hover:rotate-3 hover:scale-105 -ml-8 md:-ml-16 z-10">
              <div className="rounded-xl overflow-hidden border shadow-xl bg-white">
                <Image
                  src="/quality.png"
                  alt="image of commit quality"
                  width={1000}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Login/Signup Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 px-8">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-8">
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
