// src/components/SummaryBox.jsx
import React, { useEffect, useState } from "react";
import { fetchSummary } from "./all.js";

const SummaryBox = ({ filename, token }) => {
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadSummary() {
            try {
                setLoading(true);
                const data = await fetchSummary(filename, token);
                setSummary(data.summary);
            } catch (err) {
                console.error("Error fetching summary:", err);
                setSummary("Failed to load summary.");
            } finally {
                setLoading(false);
            }
        }
        loadSummary();
    }, [filename, token]);

    return (
        <div style={{
            marginTop: "20px",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9"
        }}>
            <h3>Summary</h3>
            <p>{loading ? "Loading..." : summary}</p>
        </div>
    );
};

export default SummaryBox;
