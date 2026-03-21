import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storeUrl, storeName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Auditing store:", storeUrl);

    const systemPrompt = `You are an expert e-commerce store auditor specializing in Shopify and dropshipping stores. 

Analyze stores for conversion rate optimization and provide actionable feedback.

For each audit, evaluate and score (1-100) these areas:
1. Homepage & First Impression
2. Product Pages
3. Trust Signals & Social Proof
4. Checkout Experience
5. Mobile Optimization
6. Site Speed Indicators
7. Navigation & UX
8. Branding & Design Consistency

Provide:
- Overall Score (1-100)
- Top 5 Critical Issues (ranked by impact)
- Top 5 Quick Wins (easy improvements)
- Detailed recommendations for each area
- Competitor comparison insights if relevant

Be specific with actionable advice.`;

    const userPrompt = `Audit this e-commerce store:

Store URL: ${storeUrl}
${storeName ? `Store Name: ${storeName}` : ""}

Provide a comprehensive CRO audit with specific, actionable recommendations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Store audit failed");
    }

    const data = await response.json();
    const audit = data.choices?.[0]?.message?.content;

    // Extract a score from the analysis (simplified extraction)
    const scoreMatch = audit?.match(/Overall Score[:\s]*(\d+)/i);
    const overallScore = scoreMatch ? parseInt(scoreMatch[1]) : null;

    console.log("Audit complete for:", storeUrl);

    return new Response(
      JSON.stringify({ audit, overallScore }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in audit-store:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
