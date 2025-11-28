exports.handler = async (event, context) => {
  const target = event.queryStringParameters.u;

  if (!target) {
    return {
      statusCode: 400,
      body: "Missing ?u= URL"
    };
  }

  return {
    statusCode: 302,
    headers: {
      "Location": target,
      "Referer": "https://urlprime.com/JnVL",  // your refer agent
      "Cache-Control": "no-store"
    },
    body: ""
  };
};
