export async function handler(event, context) {
  const sourceUrl = "https://raw.githubusercontent.com/vaathala00/jo/refs/heads/main/stream.json";

  try {
    const res = await fetch(sourceUrl);
    const data = await res.json();

    // FIX: Convert object with numeric keys to array
    const items = Object.values(data);

    const m3u = items.map(item => {
      return `
#EXTINF:-1 tvg-id="" group-title="" tvg-logo="",Channel
#KODIPROP:inputstream.adaptive.license_type=clearkey
#KODIPROP:inputstream.adaptive.license_key=https://vercel-php-clearkey-hex-base64-json.vercel.app/api/results.php?kid=${item.kid}&key=${item.key}
#EXTVLCOPT:http-user-agent=Mozilla/5.0
#EXTHTTP:{"cookie":"your_cookie_here"}
${item.url}
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
