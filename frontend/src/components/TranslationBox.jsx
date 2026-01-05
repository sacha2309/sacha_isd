import React, { useEffect, useState } from "react";
import { RefreshCw, Globe } from 'lucide-react';

const TranslationBox = ({ filename, language = "ar", triggerTranslation }) => {
  const [translation, setTranslation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const languageOptions = [
    { code: 'ar', name: 'Arabic' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: 'Japanese' },
  ];

  const displayLanguage = languageOptions.find(l => l.code === language)?.name || language;

  useEffect(() => {
    if (!filename || !language || !triggerTranslation) return;

    const loadTranslation = async () => {
      setLoading(true);
      setError(null);
      setTranslation("");

      try {
        const res = await fetch('/api/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename, language }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Server error');

        setTranslation(data.translatedText);

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTranslation();
  }, [filename, language, triggerTranslation]);

  if (!filename) return null;

  return (
    <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe size={20} /> Translation ({displayLanguage})
        </h3>
        {loading && <RefreshCw className="animate-spin text-indigo-500" size={20} />}
      </div>
      {error && <p className="text-red-600 font-medium">{error}</p>}
      {!error && !loading && <pre className="whitespace-pre-wrap">{translation}</pre>}
      {loading && <p className="text-gray-500 italic">Translating PDF text...</p>}
    </div>
  );
};

export default TranslationBox;
