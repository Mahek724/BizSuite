import axios from "axios";

export const getAISummary = async (data) => {
  const token = localStorage.getItem("token");

  const res = await axios.post(
    `${import.meta.env.VITE_API_URL}/api/ai-summary`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data.summary;
};
