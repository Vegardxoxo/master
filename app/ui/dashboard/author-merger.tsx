"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { User, Mail } from "lucide-react"
import { Button } from "@/app/ui/button"

// Updated interface to match the new data format
interface CommitData {
  id: string
  repositoryId: string
  sha: string
  authorName: string
  authorEmail: string
  committedAt: string
  message: string
  url: string
  additions: number
  deletions: number
  changedFiles: number
  createdAt: string
}

interface Author {
  name: string
  email: string
}

interface AuthorMappings {
  [key: string]: Author
}

// Updated function to extract unique authors from the new data format
export function extractUniqueAuthors(commits: CommitData[]): Author[] {
  const uniqueAuthors = new Map<string, Author>()

  commits.forEach((commit) => {
    const name = commit.authorName
    const email = commit.authorEmail
    const key = `${name}|${email}`

    if (!uniqueAuthors.has(key)) {
      uniqueAuthors.set(key, { name, email })
    }
  })

  return Array.from(uniqueAuthors.values())
}

interface AuthorMergerProps {
  data: CommitData[]
  onMerge: (consolidatedData: CommitData[]) => void
}

export default function AuthorMerger({ data, onMerge }: AuthorMergerProps) {
  const [commitData, setCommitData] = useState<CommitData[]>(data)
  const [uniqueAuthors, setUniqueAuthors] = useState<Author[]>([])
  const [authorMappings, setAuthorMappings] = useState<AuthorMappings>({})
  const [consolidatedCommits, setConsolidatedCommits] = useState<CommitData[] | null>(null)

  // Initialize the component with the data
  useEffect(() => {
    const authors = extractUniqueAuthors(data)

    // Sort authors by name to group similar entries together
    const sortedAuthors = [...authors].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))

    setUniqueAuthors(sortedAuthors)

    // Initialize mappings with identity mapping (each author maps to themselves)
    const initialMappings: AuthorMappings = {}
    sortedAuthors.forEach((author) => {
      const key = `${author.name}|${author.email}`
      initialMappings[key] = { name: author.name, email: author.email }
    })

    setAuthorMappings(initialMappings)
  }, [data])

  // Update the mapping for a specific author
  const updateAuthorMapping = (originalName: string, originalEmail: string, newName: string, newEmail: string) => {
    const key = `${originalName}|${originalEmail}`

    setAuthorMappings((prev) => ({
      ...prev,
      [key]: { name: newName, email: newEmail },
    }))
  }

  // Apply the mappings to the commit data
  const applyMappings = () => {
    // Updated to work with the new data format
    const updatedCommits = commitData.map((commit) => {
      const originalName = commit.authorName
      const originalEmail = commit.authorEmail
      const key = `${originalName}|${originalEmail}`
      const mappedAuthor = authorMappings[key] || { name: originalName, email: originalEmail }

      return {
        ...commit,
        authorName: mappedAuthor.name,
        authorEmail: mappedAuthor.email,
      }
    })

    // Store the result in a variable
    setConsolidatedCommits(updatedCommits)

    // Show a toast notification to confirm the action
    toast({
      title: "Mappings applied successfully",
      description: `Consolidated ${commitData.length} commits with ${uniqueAuthors.length} unique authors.`,
    })

    // Call the onMerge callback with the consolidated data
    onMerge(updatedCommits)
  }

  // Count how many authors are mapped to each target identity
  const getTargetCounts = () => {
    const targetCounts = new Map<string, number>()

    Object.values(authorMappings).forEach((target) => {
      const targetKey = `${target.name}|${target.email}`
      const currentCount = targetCounts.get(targetKey) || 0
      targetCounts.set(targetKey, currentCount + 1)
    })

    return targetCounts
  }

  // Get all unique target identities (what authors are mapped to)
  const getUniqueTargetIdentities = () => {
    const targets = new Map<string, { name: string; email: string; color: string }>()
    const colors = [
      "bg-blue-100 border-blue-300 text-blue-800",
      "bg-green-100 border-green-300 text-green-800",
      "bg-purple-100 border-purple-300 text-purple-800",
      "bg-yellow-100 border-yellow-300 text-yellow-800",
      "bg-pink-100 border-pink-300 text-pink-800",
      "bg-indigo-100 border-indigo-300 text-indigo-800",
      "bg-red-100 border-red-300 text-red-800",
      "bg-orange-100 border-orange-300 text-orange-800",
      "bg-teal-100 border-teal-300 text-teal-800",
      "bg-cyan-100 border-cyan-300 text-cyan-800",
    ]

    let colorIndex = 0
    const targetCounts = getTargetCounts()

    // Only create color entries for targets that have multiple authors
    targetCounts.forEach((count, targetKey) => {
      if (count > 1) {
        const [name, email] = targetKey.split("|")
        targets.set(targetKey, {
          name,
          email,
          color: colors[colorIndex % colors.length],
        })
        colorIndex++
      }
    })

    return targets
  }

  // Check if an author is mapped to a different identity
  const isMappedToDifferent = (author: Author) => {
    const key = `${author.name}|${author.email}`
    const mapping = authorMappings[key]

    if (!mapping) return false

    return mapping.name !== author.name || mapping.email !== author.email
  }

  // Get the target identity for an author
  const getTargetIdentity = (author: Author) => {
    const key = `${author.name}|${author.email}`
    return authorMappings[key]
  }

  // Get color class for an author based on what they're mapped to
  const getColorForAuthor = (author: Author) => {
    const targetIdentity = getTargetIdentity(author)
    if (!targetIdentity) return ""

    const targetKey = `${targetIdentity.name}|${targetIdentity.email}`
    const uniqueTargets = getUniqueTargetIdentities()

    // Only return a color if this target has a color (meaning multiple authors map to it)
    return uniqueTargets.get(targetKey)?.color || ""
  }

  return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Author Identity Consolidation</h1>
        <p className="text-muted-foreground mb-4">
          Consolidate different author identities before proceeding to the visualization. Authors mapped to the same
          identity will share the same color when multiple authors are mapped to that identity.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Author Mappings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uniqueAuthors.map((author, index) => {
                const isMapped = isMappedToDifferent(author)
                const targetIdentity = getTargetIdentity(author)
                const colorClass = getColorForAuthor(author)

                return (
                    <div key={`${author.name}|${author.email}`} className={`p-3 border rounded-md ${colorClass}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{author.name}</span>
                        </div>

                        {isMapped && (
                            <Badge variant="outline" className="text-xs">
                              Mapped
                            </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{author.email}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor={`name-${index}`} className="text-xs mb-1 block">
                            Map to Name:
                          </Label>
                          <Input
                              id={`name-${index}`}
                              size={1}
                              className="h-8 text-sm"
                              defaultValue={author.name}
                              onChange={(e) =>
                                  updateAuthorMapping(
                                      author.name,
                                      author.email,
                                      e.target.value,
                                      authorMappings[`${author.name}|${author.email}`]?.email || author.email,
                                  )
                              }
                          />
                        </div>

                        <div>
                          <Label htmlFor={`email-${index}`} className="text-xs mb-1 block">
                            Map to Email:
                          </Label>
                          <Input
                              id={`email-${index}`}
                              size={1}
                              className="h-8 text-sm"
                              defaultValue={author.email}
                              onChange={(e) =>
                                  updateAuthorMapping(
                                      author.name,
                                      author.email,
                                      authorMappings[`${author.name}|${author.email}`]?.name || author.name,
                                      e.target.value,
                                  )
                              }
                          />
                        </div>
                      </div>

                      {isMapped && (
                          <div className="mt-2 pt-2 border-t text-xs">
                            <div className="font-medium">Mapped to:</div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{targetIdentity?.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span>{targetIdentity?.email}</span>
                            </div>
                          </div>
                      )}
                    </div>
                )
              })}
            </div>
            <Button className="w-full mt-6 flex justify-center items-center" onClick={applyMappings}>
              Apply Mappings & Continue
            </Button>
          </CardContent>
        </Card>
      </div>
  )
}
