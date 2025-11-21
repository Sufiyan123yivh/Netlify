// File: netlify/functions/sunnxt.js

export async function handler(event, context) {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/alexandermail371/cricfytv/99be12ab22cb39a6983bd63845fc5c23eb495570/sunxt.m3u"
    );

    const text = await response.text();

    const updated = text
      .replace(
        /#KODIPROP:inputstream\.adaptive\.license_key=(.*?):(.*?)\n/g,
        (match, keyid, key) => {
          return (
            `#KODIPROP:inputstream.adaptive.license_type=clearkey\n` +
            `#KODIPROP:inputstream.adaptive.license_type=clearkey\n` +
            `#KODIPROP:inputstream.adaptive.license_key=https://vercel-php-clearkey-hex-base64-json.vercel.app/api/results.php?keyid=${keyid}&key=${key}\n`
          );
        }
      )
      .replace(/%7Ccookie=/g, "||cookie=");

    const customEntry =
      `#EXTINF:-1 movie-type="web" group-title="Join" tvg-logo="usus" , join@Billa_tv\n` +
      `https://cdn.videas.fr/v-medias/s5/hlsv1/98/5f/985ff528-2486-41a4-a077-21c4228b2da0/1080p.m3u8\n`;

    const finalOutput = customEntry + updated;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/x-mpegURL",
      },
      body: finalOutput,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: "Error: " + error.message,
    };
  }
}
