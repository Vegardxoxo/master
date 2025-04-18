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
  const [activeTab, setActiveTab] = useState<"manual" | "classroom">("manual");

  return (
    <div className="flex flex-col ">
      <div className="flex justify-end mb-5 ">
        <Button
          onClick={() => setHidden(!hidden)}
          className={`min-w-[200px] flex items-center gap-2 ${
            hidden
              ? "bg-sky-500 hover:bg-sky-600"
              : "bg-sky-500 hover:bg-sky-600"
          }`}
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
      <div className="w-full max-w-3xl mx-auto ">
        {!hidden && (
          <div className="mt-4 bg-white rounded-lg shadow-sm border border-sky-100 p-6 max-w-3xl mx-auto">
            <div className="flex mb-6 border-b justify-center">
              <button
                className={`py-2 px-6 font-medium text-sm ${
                  activeTab === "manual"
                    ? "text-sky-600 border-b-2 border-sky-500"
                    : "text-gray-500 hover:text-sky-700"
                }`}
                onClick={() => setActiveTab("manual")}
              >
                Add Manually
              </button>
              <button
                className={`py-2 px-6 font-medium text-sm ${
                  activeTab === "classroom"
                    ? "text-sky-600 border-b-2 border-sky-500"
                    : "text-gray-500 hover:text-sky-700"
                }`}
                onClick={() => setActiveTab("classroom")}
              >
                Import from Classrooms
              </button>
            </div>

            <div className="max-w-2xl flex justify-center">
              {activeTab === "manual" ? (
                <AddRepositoryForm courseInstanceId={courseInstanceId} />
              ) : (
                <AddRepositoryClassroom courseInstanceId={courseInstanceId} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
