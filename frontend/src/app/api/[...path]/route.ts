import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://kampusx-backend.onrender.com").replace(/\/$/, "");

async function handleProxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const search = req.nextUrl.search;
  const targetUrl = `${BACKEND_URL}${pathname}${search}`;

  const forwardHeaders = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    // Do not forward host or hop-by-hop headers
    if (!["host", "connection", "keep-alive", "transfer-encoding", "content-length"].includes(lower)) {
      forwardHeaders.set(key, value);
    }
  });

  try {
    let bodyBuffer: ArrayBuffer | undefined = undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      const buf = await req.arrayBuffer();
      if (buf.byteLength > 0) {
        bodyBuffer = buf;
      }
    }

    const backendResponse = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: bodyBuffer,
      // Render free-tier cold starts & Gmail SMTP can take 60-140s.
      // Set a 180-second timeout so Node does not hang up with ECONNRESET.
      signal: AbortSignal.timeout(180_000),
    });

    const responseData = await backendResponse.arrayBuffer();
    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (!["content-encoding", "transfer-encoding", "content-length", "connection"].includes(lower)) {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(responseData, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    console.error("API proxy error:", error);
    const err = error as { name?: string; message?: string };
    if (err?.name === "TimeoutError") {
      return NextResponse.json(
        { error: "The server is taking longer than expected to send your verification email. Please try again in a moment." },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "Unable to reach authentication server. Please check your network and try again." },
      { status: 502 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
export const OPTIONS = handleProxy;
