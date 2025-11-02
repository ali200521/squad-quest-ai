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
    const PPLX_API_KEY = Deno.env.get("PPLX_API_KEY");
    if (!PPLX_API_KEY) {
      throw new Error("PPLX_API_KEY is not configured");
    }

    // Compose your quiz prompt for Perplexity
    const prompt = `Create a ${numQuestions}-question multiple choice quiz about "${topic}", difficulty level: ${difficulty}.
    Return the quiz as JSON array: each object must have question, options (A,B,C,D), correct_answer (A/B/C/D), and short explanation.`;

    const payload = {
      model: "sonar-medium-chat", // You can also try "sonar-small-chat" or "sonar-large-chat"
      messages: [
        { role: "user", content: prompt }
      ]
    };

    const response = await fetch(
      "https://api.perplexity.ai/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${PPLX_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    // You want the AI's reply; it comes as choices[0].message.content
    const quizContent = data.choices?.[0]?.message?.content || "[]";
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
