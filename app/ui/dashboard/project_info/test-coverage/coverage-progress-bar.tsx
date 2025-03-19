import {getCoverageColor} from "@/app/ui/dashboard/project_info/test-coverage/coverage-utils";

interface CoverageProgressBarProps {
  percentage: number
  label: string
  showPercentage?: boolean
  height?: string
}

export function CoverageProgressBar({
  percentage,
  label,
  showPercentage = true,
  height = "h-4",
}: CoverageProgressBarProps) {
  const colorClass = getCoverageColor(percentage)

  return (
    <div className="mb-2">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        {showPercentage && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{percentage.toFixed(1)}%</span>
        )}
      </div>
      <div className={`w-full bg-gray-200 rounded-full dark:bg-gray-700 ${height}`}>
        <div
          className={`${colorClass} ${height} rounded-full transition-all duration-500 ease-in-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

