import { LanguageData } from "@/app/ui/dashboard/project_info/language-distribution";

export function formatLanguageData(
  rawData: Record<string, number>,
  maxLanguages: number = 10,
): LanguageData[] {
  const totalBytes = Object.values(rawData).reduce(
    (sum, bytes) => sum + bytes,
    0,
  );

  let formattedData: LanguageData[] = Object.entries(rawData).map(
    ([name, value]) => ({
      name,
      value,
      percentage: totalBytes === 0 ? 0 : (value / totalBytes) * 100,
    }),
  );

  formattedData.sort((a, b) => b.percentage - a.percentage);

  if (formattedData.length > maxLanguages) {
    const topLanguages = formattedData.slice(0, maxLanguages - 1);
    const otherLanguages = formattedData.slice(maxLanguages - 1);

    const otherValue = otherLanguages.reduce(
      (sum, lang) => sum + lang.value,
      0,
    );
    const otherPercentage = otherLanguages.reduce(
      (sum, lang) => sum + lang.percentage,
      0,
    );

    formattedData = [
      ...topLanguages,
      {
        name: "Other",
        value: otherValue,
        percentage: otherPercentage,
      },
    ];
  }

  return formattedData;
}
