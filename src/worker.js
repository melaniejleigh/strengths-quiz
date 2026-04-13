export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle API route for generating insights
    if (url.pathname === "/api/generate-insights" && request.method === "POST") {
      const apiKey = env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: "API key not configured" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      try {
        const body = await request.json();
        const { prompt } = body;

        if (!prompt) {
          return new Response(
            JSON.stringify({ error: "Missing prompt" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 6000,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          return new Response(
            JSON.stringify({ error: "Claude API error", status: response.status, detail: errText }),
            { status: 502, headers: { "Content-Type": "application/json" } }
          );
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(
          JSON.stringify({ error: "Server error", message: e.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // For all other requests, let the static assets handler take over
    return env.ASSETS.fetch(request);
  },
};
