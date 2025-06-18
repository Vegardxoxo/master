"use server";
import { auth } from "@/auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { prisma } from "@/app/lib/prisma";
import { findRepositoryByOwnerRepo } from "@/app/lib/database-functions/helper-functions";

export async function saveChartImage(
  imageData: string,
  chartType: string,
  owner: string,
  repo: string,
  description?: string,
): Promise<{
  success: boolean;
  imageUrl?: string;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return {
        error: "Not authenticated",
        success: false,
      };
    }
    console.log("chartType", chartType);
    if (
      !chartType ||
      ![
        "COMMIT_FREQUENCY",
        "COMMIT_SIZE",
        "CONTRIBUTIONS",
        "PULL_REQUESTS",
        "COMMIT_CHANGED_FILES",
      ].includes(chartType)
    ) {
      return {
        success: false,
        error: "Invalid chart type",
      };
    }

    const repositoryResult = await findRepositoryByOwnerRepo(owner, repo);
    if (!repositoryResult.success || !repositoryResult.repository) {
      return {
        error:
          repositoryResult.error ||
          "Repository not found or you don't have access to it",
        success: false,
      };
    }

    // Now you can use repositoryResult.repository for further operations
    const repository = repositoryResult.repository;

    // Remove the data:image/png;base64, part
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Create a unique filename
    const uniqueFilename = `${chartType}-${owner}-${repo}.png`;

    // Define the path where images will be stored
    const publicDir = path.join(process.cwd(), "public", "charts");
    const filePath = path.join(publicDir, uniqueFilename);

    // Ensure the directory exists
    try {
      await mkdir(publicDir, { recursive: true });
    } catch (err) {
      // Directory might already exist, that's fine
    }

    // Save the file
    await writeFile(filePath, buffer);

    // Return the URL where the image can be accessed
    const imageUrl = `/charts/${uniqueFilename}`;

    await prisma.repositoryImage.upsert({
      where: {
        // This assumes you added the unique constraint on repositoryId and chartType
        repositoryId_chartType: {
          repositoryId: repository.id,
          chartType: chartType,
        },
      },
      update: {
        imageUrl: imageUrl,
        description: description,
        updatedAt: new Date(),
      },
      create: {
        repositoryId: repository.id,
        imageUrl: imageUrl,
        chartType: chartType,
        description: description,
      },
    });

    return { success: true, imageUrl };
  } catch (error) {
    console.error("Error saving chart image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save image",
    };
  }
}
