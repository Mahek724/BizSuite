import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateSummary = async (req, res) => {
  try {
    const dashboardData = req.body || {};

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API Key not found" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // PRO VERSION
    });

    const prompt = `
You are an AI dashboard assistant.

Format the output in CLEAN MARKDOWN using:
- # Main Headings
- ## Subheadings
- Bullet points
- Bold text for key metrics
- Short paragraphs

Use this structure exactly:

# 📊 Business Summary
...text...

## 🔍 Insights & Patterns
...bullet points...

## ⚠️ Risks & Warnings
...bullet points...

## 🎯 Actionable Suggestions
...bullet points...

Use a professional tone.

Dashboard Data:
${JSON.stringify(dashboardData, null, 2)}
`;

    console.log("Generating AI summary...");

    const result = await model.generateContent(prompt);
    const aiSummary = result.response.text();

    res.json({
      success: true,
      summary: aiSummary,
    });

  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate summary",
      details: error.message,
    });
  }
};
