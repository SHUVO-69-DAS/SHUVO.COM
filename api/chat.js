export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({ status: "API is running successfully." });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed", friendly: true });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "GEMINI_API_KEY is missing in server environment variables.",
      friendly: false,
    });
  }

  try {
    const { messages, language } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid request payload", friendly: true });
    }

    const safeMessages = messages.slice(-10).map((m) => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: String(m.text || "").slice(0, 1500) }],
    }));

    const lastUserText =
      [...safeMessages].reverse().find((m) => m.role === "user")?.parts?.[0]?.text || "";
    const isBangla =
      language === "bn" || /[\u0980-\u09FF]/.test(lastUserText);

    const systemInstruction = `You are the official AI Assistant for SHUVO DAS's portfolio website.
STRICT IDENTITY RULE BASED ON LANGUAGE:
1. When responding in BANGLA (বাংলা) or when the user writes in Bangla, you MUST introduce yourself and refer to yourself as Shuvo Das's "ব্যক্তিগত কামলা" (personal digital worker/assistant).
2. When responding in ANY OTHER LANGUAGE (English, Arabic, Dutch, etc.), you MUST introduce yourself and refer to yourself as Shuvo Das's "Personal AI Assistant".

PORTFOLIO CONTEXT:
- Name: SHUVO DAS (WordPress Website Developer, E-Commerce Specialist, SEO Trainer, Digital Marketer, and Virtual Assistant).
- Core Services: WordPress, Shopify & WooCommerce Development, Local SEO, Link Building, AEO & GEO, YouTube SEO, Digital Marketing, and Virtual Assistance.
- Motto: LEARNING SOMETHING NEW EVERY DAY.
- Contact: WhatsApp (+8801751275807).

Answer concisely and politely using only verified portfolio facts.${
      language && language !== "auto"
        ? ` Preferred response language code: ${String(language).slice(0, 10)}.`
        : isBangla
        ? " Respond in Bangla (বাংলা) and remember to call yourself 'ব্যক্তিগত কামলা'."
        : ""
    }`;

    // গুগলের নির্দেশিত gemini-3.8-flash মডেল এবং v1beta এন্ডপয়েন্ট
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(
        apiKey
      )}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: safeMessages,
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Upstream AI error",
        friendly: true,
      });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response right now.";

    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({
      error: "Internal server error while contacting AI.",
      friendly: true,
    });
  }
}
