import { NextRequest } from "next/server";
import { parseModelResponse } from "@/app/lib/utils/utils";
import { CommitMessageShort } from "@/app/lib/definitions/definitions";

const API_KEY = process.env.API_KEY;
const apiUrl = "http://127.0.0.1:8080/api";

export async function GET(
  request: NextRequest,
  commitMessages: CommitMessageShort,
) {
  const modelId = "commit-message-analyzer";
  try {
    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: "user",
            content: JSON.stringify(commitMessages, null, 2),
          },
        ],
      }),
    });
    const json = await response.json();
    return parseModelResponse(json);
  } catch (e) {
    console.error("Error sending commit message to LLM:", e);
    throw new Error("Failed to send message to LLM.");
  }
}
