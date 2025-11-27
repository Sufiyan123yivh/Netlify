import http from "http";
import https from "https";

export async function handler(event, context) {
  try {
    // CORS preflight
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      };
    }

    const id = event.queryStringParameters?.id;
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing 'id' query parameter." }),
      };
    }

    const targetUrl = `http://opplex.rw:8080/live/7070/0707/${id}.m3u8`;
    const agent = targetUrl.startsWith("https")
      ? new https.Agent({ keepAlive: true })
      : new http.Agent({ keepAlive: true });

    const initialResponse = await fetch(targetUrl, {
      redirect: "follow",
      agent,
    });

    if (!initialResponse.ok) {
      return {
        statusCode: initialResponse.status,
        body: JSON.stringify({
          error: "Failed to fetch data from the upstream server.",
        }),
      };
    }

    const finalUrl = initialResponse.url;
    const domain = new URL(finalUrl).origin;
    const data = await initialResponse.text();

    // Rewrite playlist URLs
    const modifiedData = data
      .split("\n")
      .map((line) => {
        if (
          (line.includes("/hls/") || line.endsWith(".ts")) &&
          !line.startsWith("http")
        ) {
          return `${domain}${line}`;
        }
        return line;
      })
      .join("\n");

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/vnd.apple.mpegurl",
        "Cache-Control": "public, max-age=10",
      },
      body: modifiedData,
    };
  } catch (error) {
    console.error("Error in M3U8 handler:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error." }),
    };
  }
}
