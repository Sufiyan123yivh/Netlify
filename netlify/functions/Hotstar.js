export async function handler(event, context) {
  const sourceUrl = "https://raw.githubusercontent.com/vaathala00/jo/refs/heads/main/stream.json";

  try {
    const res = await fetch(sourceUrl);
    const data = await res.json();

    const items = Array.isArray(data) ? data : [data];

    const m3u = items.map(item => {
      const kid = item.kid || "";
      const key = item.key || "";
      const streamUrl = item.url || "";

      return `
#EXTINF:-1 tvg-id="1373" group-title="Jiostar" tvg-logo="https://jiotvimages.cdn.jio.com/dare_images/images/Disney_Channel.png",Disney Channel
#KODIPROP:inputstream.adaptive.license_type=clearkey
#KODIPROP:inputstream.adaptive.license_key=https://your-license-server.example/api/?kid=${kid}&key=${key}
#EXTVLCOPT:http-user-agent=Mozilla/5.0
#EXTHTTP:{"cookie":"your_cookie_here"}
${streamUrl}
`;
    }).join("\n");

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: m3u,
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: "Error: " + err.toString(),
    };
  }
}
