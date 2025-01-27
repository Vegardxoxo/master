"use client";
import { AddRepository } from "@/app/ui/courses/add/add-repo-manually";
import { AddRepositoryClassroom } from "@/app/ui/courses/add/add-repo-classrooms";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function AddRepos() {
  const [hidden, setHidden] = useState<boolean>(true);
  return (
    <>
      <div className={"flex justify-end mb-5"}>
        <Button
          type={"reset"}
          variant="outline"
          onClick={() => setHidden(!hidden)}
        >
          Add Repository
        </Button>
      </div>

      {!hidden && (
        <div
          className={
            " flex items-center mb-10 space-y-10 flex-col md:flex md:flex-row md:justify-center md:space-y-0 md:space-x-10"
          }
        >
          <AddRepository />
          <AddRepositoryClassroom />
        </div>
      )}
    </>
  );
}
