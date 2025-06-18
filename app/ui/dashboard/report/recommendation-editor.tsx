"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface RecommendationEditorProps {
  value: string;
  onChange: (value: string) => void;
  title: string;
  description?: string;
  sectionId: string;
  onFocus?: (sectionId: string) => void;
  height?: number;
}

export default function RecommendationEditor({
  value,
  onChange,
  title,
  description,
  sectionId,
  onFocus,
}: RecommendationEditorProps) {
  const handleFocus = () => {
    if (onFocus) {
      onFocus(sectionId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          className="min-h-[150px]"
          placeholder={`Add your recommendations for ${title.toLowerCase()}...`}
        />
      </CardContent>
    </Card>
  );
}
