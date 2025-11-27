import http from "http";
import https from "https";

export default async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.status(204).end();
      return;
    }

    const { id } = req.query;
    if (!id) {
      res.status(400).json({ error: "Missing 'id' query parameter." });
      return;
    }

    const targetUrl = `http://opplex.rw:8080/live/7070/0707/${id}.m3u8`;
    const agent = targetUrl.startsWith("https") ? new https.Agent({ keepAlive: true }) : new http.Agent({ keepAlive: true });

    const initialResponse = await fetch(targetUrl, { redirect: "follow", agent });
    if (!initialResponse.ok) {
      res.status(initialResponse.status).json({ error: "Failed to fetch data from the upstream server." });
      return;
    }

    const finalUrl = initialResponse.url;
    const domain = new URL(finalUrl).origin;
    const data = await initialResponse.text();

    const modifiedData = data
      .split("\n")
      .map(line => {
        if ((line.includes("/hls/") || line.endsWith(".ts")) && !line.startsWith("http")) {
          return `${domain}${line}`;
        }
        return line;
      })
      .join("\n");

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Cache-Control", "public, max-age=10");
    res.status(200).send(modifiedData);

  } catch (error) {
    console.error("Error in M3U8 handler:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
