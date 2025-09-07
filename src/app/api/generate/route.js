// src/app/api/generate/route.js
export async function POST(req) {
    try {
        const { prompt } = await req.json();

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "HTTP-Referer": "http://localhost:3000", 
            "X-Title": "AI Cover Letter Generator"
        },
        body: JSON.stringify({
            model: "mistralai/mistral-7b-instruct",
            messages: [
            { role: "system", content: "You are a helpful assistant that writes professional cover letters." },
            { role: "user", content: prompt }
            ]
        })
        });

        const data = await response.json();
        const result = data.choices?.[0]?.message?.content || "No output received";

        return Response.json({ result }); 

    } catch (err) {
        console.error("Error:", err);
        return new Response(JSON.stringify({ error: "Failed to call OpenRouter API." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
        });
    }
}
