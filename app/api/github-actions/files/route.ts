import {updateRepositoryFiles} from "@/app/lib/server-actions/actions";
import {NextRequest, NextResponse} from "next/server";
import {findRepositoryByGithubId} from "@/app/lib/database-functions/helper-functions";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const apiKey = authHeader?.replace("Bearer ", "");

  // Check token
  if (!process.env.WEBHOOK_SECRET || apiKey !== process.env.WEBHOOK_SECRET) {
    console.log("Missing or invalid API key.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();

    // Extract repository and commit information
    const repoId = payload.repository_id;
    const repoName = payload.repository_name;
    const commit = payload.commit;
    const branch = payload.branch;

    // Extract file list
    const fileList = payload.file_list;


    // Validate file list structure
    if (!fileList || !Array.isArray(fileList.files)) {
      throw new Error("Invalid file list format: Missing or invalid 'files' array");
    }

    // Find the repository by GitHub ID
    const repository = await findRepositoryByGithubId(repoId);

    if (!repository) {
      throw new Error(`Repository with GitHub ID ${repoId} not found`);
    }

    // Process the files
    const fileCount = fileList.files.length;

    // Count files by extension (for response only)
    const filesByExtension = fileList.files.reduce((acc: Record<string, number>, file: { path: string }) => {
      const extension = file.path.split('.').pop()?.toLowerCase() || 'no-extension';
      acc[extension] = (acc[extension] || 0) + 1;
      return acc;
    }, {});

    // Prepare file data for the database
    const fileData = fileList.files.map((file: { path: string }) => {
      const pathParts = file.path.split('.');
      const extension = pathParts.length > 1 ? pathParts.pop()?.toLowerCase() || '' : '';

      return {
        path: file.path,
        extension: extension || 'no-extension',
      };
    });

    // Use the action to update the database
    const fileSet = await updateRepositoryFiles(
      repository.id,
      branch,
      commit,
      fileData
    );

    return NextResponse.json({
      success: true,
      message: "Files updated successfully",
      repositoryId: repoId,
      repositoryName: repoName,
      commit,
      branch,
      timestamp: new Date().toISOString(),
      fileCount,
      filesByExtension,
      fileSetId: fileSet.id
    });

  } catch (error) {
    console.error("Error processing file list:", error);
    return NextResponse.json(
      {
        error: "Failed to process file list",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
