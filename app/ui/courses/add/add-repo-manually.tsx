"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import type { CheckedState } from "@radix-ui/react-checkbox"
import { createRepository } from "@/app/lib/server-actions/actions"
import { useActionState } from "react"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export function AddRepositoryForm({ courseInstanceId }: { courseInstanceId: string }) {
  const router = useRouter()
  const [formState, formAction, isPending] = useActionState(createRepository, undefined)

  const [platform, setPlatform] = useState<string>("")
  const [username, setUsername] = useState<string>("")
  const [repoName, setRepoName] = useState<string>("")
  const [url, setUrl] = useState<string>("")
  const [isEditable, setIsEditable] = useState(false)

  const isFormValid = platform && username && repoName

  // Reset URL when inputs change
  useEffect(() => {
    if (platform && username && repoName) {
      setUrl(`https://${platform}.com/${username}/${repoName}`)
    } else {
      setUrl("")
    }
  }, [platform, username, repoName])

  // Reset form after successful submission
  useEffect(() => {
    if (formState?.success) {
      setPlatform("")
      setUsername("")
      setRepoName("")
      setUrl("")
      setIsEditable(false)

      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh()
      }, 1500)
    }
  }, [formState, router])

  function handleCheck(value: CheckedState) {
    setIsEditable(!!value)
  }

  // Custom form submission handler to ensure all data is properly sent
  const handleSubmit = async (formData: FormData) => {
    // Add the courseInstanceId
    formData.append("courseInstanceId", courseInstanceId)

    // Make sure platform, username, and repoName are included
    if (platform) formData.set("platform", platform)
    if (username) formData.set("username", username)
    if (repoName) formData.set("repoName", repoName)

    // Set the URL (either from the input or constructed)
    if (isEditable) {
      formData.set("url", url)
    } else {
      formData.set("url", `https://${platform}.com/${username}/${repoName}`)
    }

    // Call the server action
    return formAction(formData)
  }

  return (
    <Card className="w-[350px]">
      <form action={handleSubmit}>
        <CardHeader>
          <CardTitle>Manually Add Repository</CardTitle>
          <CardDescription>Add a GitHub or GitLab repository URL.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid w-full items-center gap-4">
            {/* We'll add the courseInstanceId in the handleSubmit function */}

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="platform">Platform</Label>
              <Select name="platform" value={platform} onValueChange={setPlatform} disabled={isPending}>
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="github">GitHub</SelectItem>
                  <SelectItem value="gitlab">GitLab</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="Repository owner"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="repoName">Repository</Label>
              <Input
                id="repoName"
                name="repoName"
                placeholder="Repository name"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                disabled={isPending}
              />
            </div>

            {platform && username && repoName && (
              <div className="text-sm text-muted-foreground">
                <Label htmlFor="preview">Preview</Label>
                <div className="flex justify-end gap-x-4">
                  <Checkbox
                    id="manual-edit"
                    checked={isEditable}
                    onCheckedChange={handleCheck}
                    aria-label="Toggle manual editing"
                    disabled={isPending}
                  />
                  <label htmlFor="manual-edit">Edit</label>
                </div>

                <Input
                  id="preview"
                  name="url"
                  placeholder="Preview"
                  value={url}
                  disabled={!isEditable || isPending}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            )}

            {/* Message container with fixed height to prevent layout shifts */}
            <div className="min-h-[24px]">
              {formState?.error && (
                <div className="flex items-center text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {formState.error}
                </div>
              )}
              {formState?.success && (
                <div className="flex items-center text-green-500 text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {formState.message || "Repository added successfully!"}
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            type="reset"
            variant="outline"
            onClick={() => {
              setPlatform("")
              setUsername("")
              setRepoName("")
              setUrl("")
              setIsEditable(false)
            }}
            disabled={isPending}
          >
            Clear
          </Button>

          <Button type="submit" disabled={!isFormValid || isPending}>
            {isPending ? "Adding..." : "Add Repository"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

