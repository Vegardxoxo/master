import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Eye, FileText, Upload, Loader2, Check } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor").then((mod) => mod.default), { ssr: false })
const MDPreview = dynamic(() => import("@uiw/react-markdown-preview").then((mod) => mod.default), { ssr: false })

interface FinalReportProps {
  content: string
  title: string
  owner: string
  repo: string
}

export default function FinalReport({ content, title, owner, repo }: FinalReportProps) {
  const [editableMarkdown, setEditableMarkdown] = useState(content)
  const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview")
  const [isUploading, setIsUploading] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)
  const { toast } = useToast()

  const handleCopy = () => {
    navigator.clipboard.writeText(editableMarkdown)
    toast({
      title: "Copied to clipboard",
      description: "The markdown content has been copied to your clipboard.",
    })
  }



  return (
    <div className="container mx-auto p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Button
          variant="default"
          disabled={isUploading || isUploaded}
          className="bg-green-600 hover:bg-green-700"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : isUploaded ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Uploaded
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload to Repository
            </>
          )}
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "preview" | "edit")}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="preview" className="flex items-center">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Edit
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              Copy Markdown
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditableMarkdown(content)}
              disabled={editableMarkdown === content}
            >
              Reset Changes
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="preview" className="h-full mt-0 data-[state=active]:flex flex-col">
            <div className="bg-muted rounded-md flex-1 overflow-auto p-4">
              <MDPreview source={editableMarkdown} />
            </div>
          </TabsContent>

          <TabsContent value="edit" className="h-full mt-0 data-[state=active]:flex flex-col overflow-hidden">
            <div data-color-mode="light" className="flex-1">
              <MDEditor
                value={editableMarkdown}
                onChange={(value) => setEditableMarkdown(value || "")}
                height="100%"
                preview="edit"
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
