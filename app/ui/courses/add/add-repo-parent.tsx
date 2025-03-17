"use client";
import { AddRepositoryForm } from "@/app/ui/courses/add/add-repo-manually";
import { AddRepositoryClassroom } from "@/app/ui/courses/add/add-repo-classrooms";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

export default function AddRepoParent({
  courseInstanceId,
}: {
  courseInstanceId: string;
}) {
  const [hidden, setHidden] = useState<boolean>(true);

  return (
    <>
      <div className="flex justify-end mb-5">
        <Button
          variant="outline"
          onClick={() => setHidden(!hidden)}
          className="flex items-center gap-2"
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

      {!hidden && (
        <div className="flex flex-col md:flex-row justify-center gap-6 mb-10">
          <AddRepositoryForm courseInstanceId={courseInstanceId} />
          <AddRepositoryClassroom courseInstanceId={courseInstanceId} />
        </div>
      )}
    </>
  );
}
