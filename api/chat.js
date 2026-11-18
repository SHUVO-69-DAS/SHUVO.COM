export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method === "GET") return res.status(200).json({ status: "OK" });
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key missing" });

  try {
    const { messages, language } = req.body || {};
    const lastUserText = messages?.[messages.length - 1]?.text || "Hi";
    const isBangla = language === "bn" || /[\u0980-\u09FF]/.test(lastUserText);

    const systemPrompt = `You are Shuvo AI Assistant for SHUVO DAS.
CRITICAL RULES:
1. If the user writes in Bangla, Banglish, or asks in Bangla, you MUST introduce yourself and refer to yourself as his "ব্যক্তিগত কামলা".
2. If the user writes in any other language, call yourself his "Personal AI Assistant".
Services: WordPress, Shopify, WooCommerce, SEO, AEO & GEO, YouTube SEO.
User message: ${lastUserText}`;

    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
        }),
      }
    );

    const data = await apiRes.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "দুঃখিত, এখন উত্তর দিতে পারছি না।";

    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}
