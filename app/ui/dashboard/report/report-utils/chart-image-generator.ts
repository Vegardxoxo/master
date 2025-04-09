import { DayEntry } from "@/app/lib/definitions/definitions";

export async function generateChartImage(
  data: DayEntry[],
  authors: Record<string, string>,
  selectedAuthors: string[] = ["TOTAL@commits"],
): Promise<string> {
  try {
    const reponse = await fetch("/api/chart/commit-frequency", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data,
        authors,
        selectedAuthors,
      }),
    });
    if (!reponse.ok) {
      throw new Error("Failed to image of the chart.");
    }
    const { imageUrl } = await reponse.json();
    return imageUrl;
  } catch (e) {
    console.error("Error generating chart image: ", e);
    throw e;
  }
}
