import { AlertTriangle } from "lucide-react";

interface WarningProps {
  title: string;
  message: string;
}

export default function Warning({title, message}: WarningProps) {
  return (
    <div className="p-6 border-b border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 rounded-t-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="text-xl font-semibold text-amber-800 dark:text-amber-300">
            {title}
          </h2>
          <p className="text-amber-700 dark:text-amber-400 mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
}
