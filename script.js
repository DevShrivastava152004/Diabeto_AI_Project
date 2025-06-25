document.getElementById("logForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const log = {
    date: document.getElementById("date").value,
    sugar: document.getElementById("sugar").value,
    meal: document.getElementById("meal").value,
    insulin: document.getElementById("insulin").value,
    weight: document.getElementById("weight").value
  };

  // Save to localStorage
  let logs = JSON.parse(localStorage.getItem("diabetesLogs")) || [];
  logs.push(log);
  localStorage.setItem("diabetesLogs", JSON.stringify(logs));

  alert("Log saved successfully ✅");
  document.getElementById("logForm").reset();
});

// Handle AI Analyze button
document.getElementById("analyzeBtn").addEventListener("click", async function () {
  const logs = JSON.parse(localStorage.getItem("diabetesLogs")) || [];
  if (logs.length === 0) return alert("No data to analyze 😕");

  const latestLog = logs[logs.length - 1];

  const prompt = `You are a diabetes expert. Here's today's log:\n
  - Date: ${latestLog.date}
  - Sugar: ${latestLog.sugar}
  - Meal: ${latestLog.meal}
  - Insulin: ${latestLog.insulin}
  - Weight: ${latestLog.weight}
  
  Give advice on sugar control and weight gain.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer YOUR_API_KEY_HERE"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();
  const message = data.choices?.[0]?.message?.content || "No response from AI.";
  document.getElementById("aiResponse").innerText = message;
});
