"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor").then((mod) => mod.default), { ssr: false })

interface RecommendationEditorProps {
  value: string
  onChange: (value: string | undefined) => void
  title: string
  description?: string
  height?: number
}

export default function RecommendationEditor({
  value,
  onChange,
  title,
  description,
  height = 200,
}: RecommendationEditorProps) {
  const [mounted, setMounted] = useState(false)

  // Handle SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div data-color-mode="light">
          <MDEditor value={value} onChange={onChange} preview="edit" height={height} className="border rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
}

