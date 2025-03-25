"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { FileIcon, isSensitiveFile, isWarningFile } from "./file-icon"
import { cn } from "@/app/lib/utils/utils"

type FileNode = {
  id: string
  name: string
  path: string
  extension?: string
  children: Record<string, FileNode>
  isDirectory: boolean
}

export function FileTreeNode({
  node,
  depth = 0,
  onSelectFile,
}: {
  node: FileNode
  depth?: number
  onSelectFile?: (file: FileNode) => void
}) {
  const [isOpen, setIsOpen] = useState(depth < 1)
  const hasChildren = Object.keys(node.children).length > 0

  const handleToggle = () => {
    if (node.isDirectory) {
      setIsOpen(!isOpen)
    } else if (onSelectFile) {
      onSelectFile(node)
    }
  }

  const isSensitive = isSensitiveFile(node.path)
  const isWarning = isWarningFile(node.path)

  return (
    <div>
      <div
        className={cn(
          "flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer group",
          !node.isDirectory && "hover:text-blue-500",
          isSensitive && "bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30",
          isWarning && "bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleToggle}
      >
        {node.isDirectory && hasChildren ? (
          isOpen ? (
            <ChevronDown className="h-4 w-4 mr-1 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-1 text-gray-500" />
          )
        ) : (
          <span className="w-5" />
        )}
        <FileIcon path={node.path} extension={node.extension} isDirectory={node.isDirectory} isOpen={isOpen} />
        <span
          className={cn(
            "ml-2 text-sm truncate",
            isSensitive && "text-red-700 dark:text-red-400 font-medium",
            isWarning && "text-amber-700 dark:text-amber-400 font-medium",
          )}
        >
          {node.name}
        </span>

        {/* Tooltip for sensitive/warning files */}
        {(isSensitive || isWarning) && (
          <span className="ml-auto opacity-0 group-hover:opacity-100 text-xs px-2 py-0.5 rounded-full transition-opacity duration-200 ease-in-out">
            {isSensitive ? "Sensitive" : "Warning"}
          </span>
        )}
      </div>

      {isOpen && node.isDirectory && (
        <div>
          {Object.values(node.children).map((childNode) => (
            <FileTreeNode key={childNode.id} node={childNode} depth={depth + 1} onSelectFile={onSelectFile} />
          ))}
        </div>
      )}
    </div>
  )
}

