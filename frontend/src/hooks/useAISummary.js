import { useState } from "react";
import { getAISummary } from "../services/dashboardAI";

const useAISummary = () => {
  // ✅ Load old summary when hook initializes
  const [summary, setSummary] = useState(() => {
    return localStorage.getItem("ai_summary") || "";
  });

  const [loading, setLoading] = useState(false);

  const generateSummary = async (data) => {
    try {
      setLoading(true);
      const result = await getAISummary(data);

      setSummary(result);

      // ✅ Save summary so it stays after navigation
      localStorage.setItem("ai_summary", result);

    } catch (err) {
      console.error("AI Summary Error:", err);
      setSummary("AI failed to generate summary.");
      localStorage.setItem("ai_summary", "AI failed to generate summary.");
    } finally {
      setLoading(false);
    }
  };

  const closeSummary = () => {
    setSummary("");

    // ❌ Remove stored summary when user closes manually
    localStorage.removeItem("ai_summary");
  };

  return { summary, loading, generateSummary, closeSummary };
};

export default useAISummary;
