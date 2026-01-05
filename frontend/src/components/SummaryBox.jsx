// src/components/SummaryBox.jsx
import React, { useEffect, useState } from "react";
import { fetchSummary } from "./all.js"; // تأكد أن fetchSummary يدعم language

const languageOptions = [
  { code: 'ar', name: 'Arabic' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: 'Japanese' },
];

const SummaryBox = ({ filename, token, language = "en", triggerSummary }) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const displayLanguage = languageOptions.find(l => l.code === language)?.name || language;

  useEffect(() => {
    if (!filename || !language || !triggerSummary) return;

    async function loadSummary() {
      setLoading(true);
      setError(null);
      setSummary("");

      try {
        // هنا نفترض أن fetchSummary يدعم إرسال اللغة
        const data = await fetchSummary(filename, token, language);
        setSummary(data.summary);
      } catch (err) {
        console.error("Error fetching summary:", err);
        setError("Failed to load summary.");
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, [filename, token, language, triggerSummary]);

  if (!filename) return null;

  return (
    <div style={{
      marginTop: "20px",
      padding: "15px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      backgroundColor: "#f9f9f9"
    }}>
      <h3>Summary ({displayLanguage})</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>{loading ? "Loading..." : summary}</p>
    </div>
  );
};

export default SummaryBox;
