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

type RepositoryInfo = {
  owner: string;
  repo: string;
};

type ReportContextType = {
  addMetricData: (key: string, data: any, metrics: Record<string, any>) => void;
  getMetricData: (key: string) => MetricData | undefined;
  getAllMetricsData: () => Record<string, MetricData>;
  clearMetricsData: () => void;
  setRepositoryInfo: (info: RepositoryInfo) => void;
  getRepositoryInfo: () => RepositoryInfo;
  clearRepositoryInfo: () => void;
};

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [metricsData, setMetricsData] = useState<Record<string, MetricData>>(
    {},
  );
  const [repositoryInfo, setRepositoryInfoState] = useState<
    RepositoryInfo | undefined
  >(undefined);

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

  const setRepositoryInfo = useCallback((info: RepositoryInfo) => {
    setRepositoryInfoState(info);
  }, []);

  const getRepositoryInfo = useCallback(() => {
    return repositoryInfo;
  }, [repositoryInfo]);

  const clearRepositoryInfo = useCallback(() => {
    setRepositoryInfoState(undefined);
  }, []);

  return (
    <ReportContext.Provider
      value={{
        addMetricData,
        getMetricData,
        getAllMetricsData,
        clearMetricsData,
        setRepositoryInfo,
        getRepositoryInfo,
        clearRepositoryInfo,
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
