// Loading animation
import {Skeleton} from "@/components/ui/skeleton";

const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function CardSkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-2 shadow-sm`}
    >
      <div className="flex p-4">
        <div className="h-5 w-5 rounded-md bg-gray-200" />
        <div className="ml-2 h-6 w-16 rounded-md bg-gray-200 text-sm font-medium" />
      </div>
      <div className="flex items-center justify-center truncate rounded-xl bg-white px-4 py-8">
        <div className="h-7 w-20 rounded-md bg-gray-200" />
      </div>
    </div>
  );
}



export default function DashboardSkeleton() {
  return (
    <>
      <div
        className={`${shimmer} relative mb-4 h-8 w-36 overflow-hidden rounded-md bg-gray-100`}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </>
  );
}

export function CommitQualityChartSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" /> {/* Title skeleton */}
      <div className="h-[200px] relative">
        <Skeleton className="h-full  rounded-full" /> {/* Pie chart skeleton */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="h-2/3 w-2/3 rounded-full" /> {/* Inner circle skeleton */}
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center">
            <Skeleton className="h-4 w-4 rounded-full mr-2" /> {/* Legend color dot */}
            <Skeleton className="h-4 w-16" /> {/* Legend text */}
          </div>
        ))}
      </div>
    </div>
  )
}


