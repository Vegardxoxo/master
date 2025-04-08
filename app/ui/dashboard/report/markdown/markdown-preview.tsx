"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Dynamically import the markdown preview to avoid SSR issues
const MDPreview = dynamic(
  () => import("@uiw/react-markdown-preview").then((mod) => mod.default),
  { ssr: false },
);

interface MarkdownPreviewProps {
  markdown: string;
  title?: string;
  height?: number | string;
}

export default function MarkdownPreview({
  markdown,
  title = "Markdown Preview",
  height = "calc(100vh)",
}: MarkdownPreviewProps) {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="bg-muted rounded-md overflow-auto p-4"
          style={{ height }}
        >
          <MDPreview source={markdown} />
        </div>
      </CardContent>
    </Card>
  );
}
