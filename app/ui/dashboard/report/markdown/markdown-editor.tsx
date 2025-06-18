"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false },
);

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  title?: string;
  previewMode?: "live" | "edit" | "preview";
  height?: number;
}

export default function MarkdownEditor({
  value,
  onChange,
  title = "Markdown Editor",
  previewMode = "live",
  height = 400,
}: MarkdownEditorProps) {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Handle SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast({
      title: "Copied to clipboard",
      description: "The markdown content has been copied to your clipboard.",
    });
  };

  if (!mounted) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <FileText className="h-4 w-4 mr-1" />
          Copy Markdown
        </Button>
      </CardHeader>
      <CardContent>
        <div data-color-mode="light">
          <MDEditor
            value={value}
            onChange={onChange}
            preview={previewMode}
            height={height}
            className="border rounded-md"
          />
        </div>
      </CardContent>
    </Card>
  );
}
