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
  addImageUrls: (key: string, imageUrls: string[]) => void;
  getImageUrls: (key: string) => string[] | undefined;
  getAllImageUrls: () => string[];
  getAllMetricsData: () => Record<string, MetricData>;
  clearMetricsData: () => void;
  setRepositoryInfo: (info: RepositoryInfo) => void;
  getRepositoryInfo: () => RepositoryInfo | undefined;
  clearRepositoryInfo: () => void;
};

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [metricsData, setMetricsData] = useState<Record<string, MetricData>>({});
  const [repositoryInfo, setRepositoryInfoState] = useState<
    RepositoryInfo | undefined
  >(undefined);

  const [imageData, setImageData] = useState<Record<string, string[]>>({});

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

  const getMetricData = useCallback(
    (key: string) => {
      return metricsData[key];
    },
    [metricsData],
  );

  const addImageUrls = useCallback(
    (key: string, imageUrls: string[]) => {
      setImageData((prev) => ({
        ...prev,
        [key]: imageUrls,
      }));
    },
    [],
  );

  // Get stored image URLs for a given key
  const getImageUrls = useCallback(
    (key: string) => {
      return imageData[key];
    },
    [imageData],
  );

  // Return all stored image URLs
  const getAllImageUrls = useCallback(() => {
    return Object.values(imageData).flat();
  }, [imageData]);

  const getAllMetricsData = useCallback(() => {
    return metricsData;
  }, [metricsData]);

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
        addImageUrls,
        getImageUrls,
        getAllImageUrls,
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