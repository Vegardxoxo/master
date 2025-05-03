"use client"
import { AddRepositoryForm } from "@/app/ui/courses/add/add-repo-manually"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

export default function AddRepoParent({
  courseInstanceId,
}: {
  courseInstanceId: string
}) {
  const [hidden, setHidden] = useState<boolean>(true)

  return (
    <div className="flex flex-col">
      <div className="flex justify-end mb-5">
        <Button
          onClick={() => setHidden(!hidden)}
          className="min-w-[200px] flex items-center gap-2 bg-sky-500 hover:bg-sky-600"
        >
          {hidden ? (
            <>
              <Plus className="h-4 w-4" />
              <span>Add Repository</span>
            </>
          ) : (
            <>
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </>
          )}
        </Button>
      </div>
      <div className="w-full max-w-3xl mx-auto">
        {!hidden && (
          <div className="mt-4 bg-white rounded-lg shadow-sm border border-sky-100 p-6 max-w-3xl mx-auto">
            <div className="flex justify-center">
              <AddRepositoryForm courseInstanceId={courseInstanceId} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
