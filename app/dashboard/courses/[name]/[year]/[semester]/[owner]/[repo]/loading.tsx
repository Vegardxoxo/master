import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size={100} />
    </div>
  )
}
