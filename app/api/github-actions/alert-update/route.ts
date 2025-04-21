// app/api/github‑actions/updates/route.ts

import { NextRequest, NextResponse } from "next/server";
import {findRepositoryByGithubId, refreshCache} from "@/app/lib/database-functions/helper-functions";
import {updateRepositoryData} from "@/app/lib/database-functions/repository-data";

export async function POST(request: NextRequest) {
    // 1) Authenticate
    const authHeader = request.headers.get("Authorization");
    const apiKey = authHeader?.replace("Bearer ", "");
    if (!process.env.WEBHOOK_SECRET || apiKey !== process.env.WEBHOOK_SECRET) {
        console.warn("Invalid API key on updates webhook");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 2) Parse and validate payload
        const payload = await request.json();
        const githubId     = String(payload.repository_id);
        const owner        = payload.repository_name?.split("/")[0];
        const repoName     = payload.repository_name?.split("/")[1];
        const updates      = payload.updates_available;

        console.log("owner", owner, "repoName", repoName)

        if (!githubId) {
            return NextResponse.json(
                { error: "Missing repository_id in payload" },
                { status: 400 }
            );
        }
        if (!updates) {
            return NextResponse.json(
                { error: "Invalid payload: updates_available must be true" },
                { status: 400 }
            );
        }
        if (!owner || !repoName) {
            return NextResponse.json(
                { error: "Invalid repository_name format" },
                { status: 400 }
            );
        }

        // 3) Look up our internal repository record
        const repository = await findRepositoryByGithubId(githubId);
        if (!repository || !repository.id) {
            return NextResponse.json(
                { error: "Repository not found in database" },
                { status: 404 }
            );
        }

        // 4) Trigger our data‑update logic
        const result = await updateRepositoryData(owner, repoName, repository.id);
        if (!result.success) {
            console.error("Error updating repository data:", result.error);
            return NextResponse.json(
                { error: "Failed to update repository data" },
                { status: 500 }
            );
        }
        await refreshCache(githubId)

        // 5) Respond OK
        return NextResponse.json({
            success: true,
            message: "Update notification processed, data refresh kicked off",
            repositoryId:   repository.id,
            repositoryName: payload.repository_name,
            timestamp:      new Date().toISOString(),
        });

    } catch (err) {
        console.error("Error in updates webhook handler:", err);
        return NextResponse.json(
            {
                error:   "Failed to process update notification",
                details: err instanceof Error ? err.message : String(err),
            },
            { status: 500 }
        );
    }
}
