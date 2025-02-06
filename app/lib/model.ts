import { CommitMessageShort } from "@/app/lib/definitions";
import { parseModelResponse } from "@/app/lib/utils";

const API_KEY = process.env.API_KEY;
const apiUrl = "http://127.0.0.1:8080/api";

/**
 * List available models.
 */
export async function getModels() {
  try {
    const response = await fetch(`${apiUrl}/models`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching models:", error);
  }
}

/**
 * Send messages to LLM.
 * @param commitMessages
 */
export async function sendCommitMessage(commitMessages: CommitMessageShort) {
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
  } catch (error) {
    console.error("Error sending commit message to LLM:", error);
    throw new Error("Failed to send message to LLM.");
  }
}
