"use client"

import { useState, useEffect } from "react"
import type { CommitData } from "@/app/lib/definitions/definitions"

export function useAuthorConsolidation(commits: CommitData[], repoId: string) {
  const [mergedCommits, setMergedCommits] = useState<CommitData[]>([])
  const [hasMerged, setHasMerged] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Generate a unique storage key based on repo ID
  const storageKey = `author-consolidation-${repoId}`

  // Load from localStorage on initial render
  useEffect(() => {
    setIsLoading(true)
    const savedData = localStorage.getItem(storageKey)

    if (savedData) {
      try {
        const { mergedCommits, timestamp } = JSON.parse(savedData)

        // Check if data is still fresh (less than 24 hours old)
        const isDataFresh = Date.now() - timestamp < 24 * 60 * 60 * 1000

        if (isDataFresh) {
          setMergedCommits(mergedCommits)
          setHasMerged(true)
        }
      } catch (error) {
        console.error("Error loading saved author consolidation:", error)
      }
    }

    setIsLoading(false)
  }, [storageKey])

  // Save to localStorage when mergedCommits changes
  useEffect(() => {
    if (mergedCommits.length > 0) {
      const dataToSave = {
        mergedCommits,
        timestamp: Date.now(),
      }

      localStorage.setItem(storageKey, JSON.stringify(dataToSave))
    }
  }, [mergedCommits, storageKey])

  const handleMerge = (mergedData: CommitData[]) => {
    setMergedCommits(mergedData)
    setHasMerged(true)
  }

  const resetMerge = () => {
    setHasMerged(false)
    setMergedCommits([])
    localStorage.removeItem(storageKey)
  }

  return {
    mergedCommits,
    hasMerged,
    isLoading,
    handleMerge,
    resetMerge,
  }
}
