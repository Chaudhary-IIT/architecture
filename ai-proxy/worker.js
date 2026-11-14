/* OPTIONAL — free Cloudflare Worker so visitors can use the AI tutor without their own key.
   1. dash.cloudflare.com → Workers → Create → paste this file.
   2. Settings → Variables: add secret GEMINI_API_KEY (free key from aistudio.google.com/apikey)
      and variable ALLOWED_ORIGIN = https://<your-user>.github.io
   3. Put the worker URL in site/assets/config.js → proxyUrl.
   The key stays on Cloudflare; the browser never sees it. */
const MODEL = "gemini-2.5-flash"; // change if Google retires it
export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const cors = { "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*", "Access-Control-Allow-Headers": "content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return new Response("POST only", { status: 405, headers: cors });
    if (env.ALLOWED_ORIGIN && origin !== env.ALLOWED_ORIGIN) return new Response("forbidden", { status: 403, headers: cors });
    const text = await req.text();
    if (text.length > 120000) return new Response("too large", { status: 413, headers: cors });
    const body = JSON.parse(text);
    body.generationConfig = { temperature: 0.5, maxOutputTokens: 900 }; // cap cost regardless of what the client sent
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL || MODEL}:generateContent`, {
      method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY }, body: JSON.stringify(body),
    });
    return new Response(await r.text(), { status: r.status, headers: { ...cors, "content-type": "application/json" } });
  },
};
