import { saveChartImage } from "@/app/lib/server-actions/chart-actions";
import { toast } from "@/hooks/use-toast";

export const exportChart = async (
  chartRef: any,
  setIsExporting: (value: boolean) => void,
  filename: string,
) => {
  console.log("Exporting chart...");
  if (!chartRef.current) return;
  setIsExporting(true);

  try {
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(chartRef.current, {
      backgroundColor: "#ffff",
      scale: 2,
      logging: false,
    });

    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (e) {
    console.error(e);
  } finally {
    setIsExporting(false);
  }
};

type UploadChartProps = {
  chartRef: any;
  setIsUploading: (value: boolean) => void;
  owner: string;
  repo: string;
  chartType: "COMMIT_FREQUENCY" | "COMMIT_SIZE" | "CONTRIBUTIONS";
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
      // This is important - it ensures the full height is captured
      height: chartContainer.scrollHeight,
      // This ensures the full width is captured
      width: chartContainer.scrollWidth,
    });

    // Get image data as base64
    const imageData = canvas.toDataURL("image/png");

    // Upload to server
    // Upload to server
    const result = await saveChartImage(imageData, chartType, owner, repo);

    if (result.success && result.imageUrl) {
      // Show success message using the toast hook
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
      description:
        error instanceof Error
          ? `Error: ${error.message}`
          : "There was an error uploading your chart",
      variant: "destructive",
    });
    return null;
  } finally {
    setIsUploading(false);
  }
};
