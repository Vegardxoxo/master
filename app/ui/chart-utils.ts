import { saveChartImage } from "@/app/lib/server-actions/chart-actions";
import { toast } from "@/hooks/use-toast";

type UploadChartProps = {
  chartRef: any;
  setIsUploading: (value: boolean) => void;
  owner: string;
  repo: string;
  chartType:
    | "COMMIT_FREQUENCY"
    | "COMMIT_SIZE"
    | "CONTRIBUTIONS"
    | "PULL_REQUESTS"
    | "COMMIT_CHANGED_FILES";
};

export const uploadChartToServer = async ({
  chartRef,
  setIsUploading,
  owner,
  repo,
  chartType,
}: UploadChartProps): Promise<string | undefined | null> => {
  if (!chartRef.current) return;
  setIsUploading(true);

  try {
    // Instead of just capturing the SVG, capture the entire chart container
    const chartContainer = chartRef.current;

    // Add a small delay to ensure all elements are fully rendered
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Use html2canvas to capture the entire container with all elements
    const html2canvas = (await import("html2canvas")).default;

    const canvas = await html2canvas(chartContainer, {
      backgroundColor: "white",
      scale: 2, // Higher scale for better quality
      logging: false,
      allowTaint: true,
      useCORS: true,
      height: chartContainer.scrollHeight,
      width: chartContainer.scrollWidth,
    });

    const imageData = canvas.toDataURL("image/png");

    const result = await saveChartImage(imageData, chartType, owner, repo);

    if (result.success && result.imageUrl) {
      toast({
        title: "Chart uploaded successfully",
        description: "You can now use this chart in your markdown",
      });
      console.log("Chart uploaded:", result.imageUrl);
      return result.imageUrl;
    } else {
      // Handle server-side error from the saveChartImage function
      throw new Error(
        result.error || "Unknown error occurred while saving chart",
      );
    }
  } catch (error) {
    console.error("Failed to upload chart:", error);
    toast({
      title: "Upload failed",
      description: "There was an error uploading your chart",
      variant: "destructive",
    });
    return null;
  } finally {
    setIsUploading(false);
  }
};
