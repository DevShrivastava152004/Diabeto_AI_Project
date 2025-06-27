import React, { useState } from 'react';

const DiabetoLogAnalyzer = () => {
  const [log, setLog] = useState({ time: '', sugar: '', meal: '', insulin: '' });
  const [entries, setEntries] = useState(JSON.parse(localStorage.getItem("diabetoLog")) || []);
  const [analysis, setAnalysis] = useState('');

  const handleChange = (e) => {
    setLog({ ...log, [e.target.name]: e.target.value });
  };

  const saveEntry = () => {
    const updated = [...entries, log];
    localStorage.setItem("diabetoLog", JSON.stringify(updated));
    setEntries(updated);
    setLog({ time: '', sugar: '', meal: '', insulin: '' });
  };

  const generatePrompt = () => {
    let prompt = "These are my logs for today:\n";
    entries.forEach((entry, i) => {
      prompt += `${i + 1}. Time: ${entry.time}, Meal: ${entry.meal}, Sugar: ${entry.sugar} mg/dL, Insulin: ${entry.insulin} units\n`;
    });

    prompt += `
Now based on this data:
- Identify patterns (highs/lows)
- Average sugar
- Any insulin adjustment needed
- When to consult a doctor (if avg > 200 or frequent highs)
- Suggest diet/activity changes if required
`;

    return prompt;
  };

  const analyzeLog = async () => {
    const prompt = generatePrompt();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer YOUR_API_KEY_HERE", // replace with your real key
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    setAnalysis(data.choices[0].message.content);
  };

  return (
    <div className="p-4 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold">📝 Daily Diabetic Log</h2>

      <div className="grid grid-cols-2 gap-2">
        <input name="time" value={log.time} onChange={handleChange} placeholder="Time (e.g. 8:00 AM)" className="border p-2" />
        <input name="meal" value={log.meal} onChange={handleChange} placeholder="Meal Type (e.g. Post Lunch)" className="border p-2" />
        <input name="sugar" value={log.sugar} onChange={handleChange} placeholder="Sugar Level" className="border p-2" />
        <input name="insulin" value={log.insulin} onChange={handleChange} placeholder="Insulin Units" className="border p-2" />
      </div>

      <button onClick={saveEntry} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        ➕ Save Entry
      </button>

      <button onClick={analyzeLog} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        📊 Generate Daily Analysis
      </button>

      {analysis && (
        <div className="mt-4 p-3 border rounded bg-gray-50">
          <h3 className="font-semibold mb-2">AI Analysis:</h3>
          <pre className="whitespace-pre-wrap">{analysis}</pre>
        </div>
      )}
    </div>
  );
};

export default DiabetoLogAnalyzer;
