import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, difficulty, numQuestions } = await req.json();
    if (!topic || !difficulty || !numQuestions) {
      throw new Error("Missing required parameters: topic, difficulty, or numQuestions");
    }
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const systemPrompt =
      `You are an educational AI. Please generate a quiz for students. ` +
      `Topic: ${topic}\n` +
      `Difficulty: ${difficulty}\n` +
      `Number of questions: ${numQuestions}\n` +
      `Return the quiz as a JSON array of objects. Each object should include: question, options (A,B,C,D), correct_answer (A/B/C/D), and a short explanation.`;

    const payload = {
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] }
      ]
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const quizContent =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "[]";

    return new Response(
      JSON.stringify({ quiz: quizContent }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in generate-quiz:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
