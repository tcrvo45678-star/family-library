import { env } from "cloudflare:workers";

type RecognizedBook = {
  title: string;
  author?: string;
  isbn?: string;
  language?: string;
  confidence: number;
  evidence?: string;
};

const DATA_URL = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { images?: unknown };
    if (!Array.isArray(body.images) || body.images.length < 1 || body.images.length > 4) {
      return Response.json({ error: "יש לשלוח בין תמונה אחת לארבע תמונות" }, { status: 400 });
    }

    const images = body.images.map((value) => typeof value === "string" ? value.match(DATA_URL) : null);
    if (images.some((match) => !match)) {
      return Response.json({ error: "פורמט התמונה אינו נתמך" }, { status: 400 });
    }
    const totalBytes = images.reduce((sum, match) => sum + Math.ceil((match![2].length * 3) / 4), 0);
    if (totalBytes > 12 * 1024 * 1024) {
      return Response.json({ error: "התמונות גדולות מדי. נסו לצלם פחות תמונות בכל פעם" }, { status: 413 });
    }

    const prompt = `You are identifying books for a family library from photos of front covers and/or book spines.
Return one item for every distinct physical book that is actually visible, including Hebrew and English books.
Transcribe the title and author exactly when readable. Include an ISBN only if it is visibly readable; never invent one.
Do not guess missing details. Omit uncertain fields and lower the confidence. Ignore decorative text and duplicate views of the same copy.
Confidence is an integer from 0 to 100. Evidence is a very short description of the visible words that support the identification.`;

    const parts: Array<Record<string, unknown>> = [{ text: prompt }];
    for (const match of images) {
      parts.push({ inlineData: { mimeType: match![1], data: match![2] } });
    }

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent", {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              books: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    author: { type: "string" },
                    isbn: { type: "string" },
                    language: { type: "string" },
                    confidence: { type: "integer", minimum: 0, maximum: 100 },
                    evidence: { type: "string" }
                  },
                  required: ["title", "confidence"]
                }
              }
            },
            required: ["books"]
          }
        }
      }),
      signal: AbortSignal.timeout(45_000)
    });

    if (!response.ok) {
      const message = await response.text();
      console.error("Gemini recognition failed", response.status, message.slice(0, 500));
      return Response.json({ error: "שירות הזיהוי אינו זמין כרגע" }, { status: 502 });
    }

    const result = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = result.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
    const parsed = JSON.parse(text) as { books?: RecognizedBook[] };
    const books = (parsed.books || [])
      .filter((book) => typeof book.title === "string" && book.title.trim())
      .map((book) => ({
        title: book.title.trim(),
        author: typeof book.author === "string" ? book.author.trim() : "",
        isbn: typeof book.isbn === "string" ? book.isbn.replace(/[^0-9Xx]/g, "") : undefined,
        language: book.language,
        confidence: Math.max(0, Math.min(100, Math.round(Number(book.confidence) || 0))),
        evidence: book.evidence
      }));

    return Response.json({ books });
  } catch (error) {
    console.error("Recognition route error", error);
    return Response.json({ error: "לא הצלחנו לנתח את התמונות" }, { status: 500 });
  }
}
