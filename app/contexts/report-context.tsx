"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type MetricData = {
  data: any;
  metrics: Record<string, any>;
  timestamp: string;
};

type ReportContextType = {
  addMetricData: (key: string, data: any, metrics: Record<string, any>) => void;
  getMetricData: (key: string) => MetricData | undefined;
  getAllMetricsData: () => Record<string, MetricData>;
  clearMetricsData: () => void;
};

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [metricsData, setMetricsData] = useState<Record<string, MetricData>>(
    {},
  );

  const addMetricData = useCallback(
    (key: string, data: any, metrics: Record<string, any>) => {
      setMetricsData((prev) => ({
        ...prev,
        [key]: {
          data,
          metrics,
          timestamp: new Date().toISOString(),
        },
      }));
    },
    [],
  );

  // Get specific metric data by key
  const getMetricData = useCallback(
    (key: string) => {
      return metricsData[key];
    },
    [metricsData],
  );

  // Get all metrics data
  const getAllMetricsData = useCallback(() => {
    return metricsData;
  }, [metricsData]);

  // Clear all metrics data
  const clearMetricsData = useCallback(() => {
    setMetricsData({});
  }, []);

  return (
    <ReportContext.Provider
      value={{
        addMetricData,
        getMetricData,
        getAllMetricsData,
        clearMetricsData,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
}

export function useReport() {
  const context = useContext(ReportContext);

  if (context === undefined) {
    throw new Error("useReport must be used within a ReportProvider");
  }

  return context;
}
