import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BestPracticesProps {
  title: string
  children: ReactNode
}

export function BestPractices({ title, children }: BestPracticesProps) {
  return (
    <Card className="bg-muted/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">{children}</div>
      </CardContent>
    </Card>
  );
}

