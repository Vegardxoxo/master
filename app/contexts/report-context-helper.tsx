"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ReportData = {
  title: string;
  content: string;
};

type ReportContextType = {
  setReport: (report: ReportData) => void;
  getReport: () => ReportData | undefined;
  clearReport: () => void;
};

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportHelperProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [reportData, setReportData] = useState<ReportData | undefined>(
    undefined,
  );
  const clearReport = useCallback(() => {
    setReportData(undefined);
  }, []);

  return (
    <ReportContext.Provider
      value={{
        setReport: setReportData,
        getReport: () => reportData,
        clearReport,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
}

export function useReportHelper() {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error(
      "useReportHelper must be used within a ReportHelperProvider",
    );
  }
  return context;
}
