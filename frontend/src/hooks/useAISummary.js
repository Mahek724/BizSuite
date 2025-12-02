import { useState } from "react";
import { getAISummary } from "../services/dashboardAI";

const useAISummary = () => {
  const [summary, setSummary] = useState(() => {
    return localStorage.getItem("ai_summary") || "";
  });

  const [loading, setLoading] = useState(false);

  const generateSummary = async (data) => {
    try {
      setLoading(true);
      const result = await getAISummary(data);

      setSummary(result);
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
    localStorage.removeItem("ai_summary");
  };
  return { summary, loading, generateSummary, closeSummary };
};

export default useAISummary;
