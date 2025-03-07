import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const apiKey = authHeader?.replace("Bearer ", "");

  // Check token
  if (
    !process.env.WEBHOOK_SECRET ||
    apiKey !== process.env.WEBHOOK_SECRET
  ) {
    console.log("Missing or invalid API key.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    console.log(payload);
    return NextResponse.json({
      success: true,
      message: "Data received.",
      id: payload.id,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Error parsing JSON.", e);

    return NextResponse.json({
        error: "Failed to parse JSON.",
        message: e instanceof Error ? e.message : "Unknown error."


    }, {status: 500});
  }
}
