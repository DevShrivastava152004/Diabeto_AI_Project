// Auto-fill today's date
window.onload = function () {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("date").value = today;
};

async function askChatbot() {
  const question = document.getElementById("chatQuestion").value;
  if (!question.trim()) {
    alert("Please enter a question!");
    return;
  }

  document.getElementById("aiResponse").innerText = "⏳ Waiting for AI response...";

  try {
    const API_KEY = "YOUR_API_KEY_HERE"; // Your Groq API key
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "system",
            content: "You are a knowledgeable diabetes management assistant. Provide helpful and accurate advice about diabetes management, diet, and lifestyle."
          },
          {
            role: "user",
            content: question
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'API request failed');
    }

    const data = await response.json();
    const message = data?.choices?.[0]?.message?.content || "⚠️ No response from AI.";
    document.getElementById("aiResponse").innerText = message;
  } catch (error) {
    document.getElementById("aiResponse").innerText = `❌ Error: ${error.message}`;
    console.error(error);
  }
}

function saveLog() {
  const log = {
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    sugar: document.getElementById("sugar").value,
    meal: document.getElementById("meal").value,
    mealType: document.getElementById("mealType").value,
    insulin: document.getElementById("insulin").value,
    insulinUnits: document.getElementById("insulinUnits").value,
    weight: document.getElementById("weight").value,
    notes: document.getElementById("notes").value
  };

  const logs = JSON.parse(localStorage.getItem("diabetesLogs") || "[]");
  logs.push(log);
  localStorage.setItem("diabetesLogs", JSON.stringify(logs));

  alert("✅ Log saved successfully!");
  resetForm();
}

function resetForm() {
  document.getElementById("sugar").value = "";
  document.getElementById("meal").value = "";
  document.getElementById("mealType").value = "breakfast";
  document.getElementById("insulin").value = "None";
  document.getElementById("insulinUnits").value = "";
  document.getElementById("weight").value = "";
  document.getElementById("notes").value = "";
}

function getDailySummary() {
  const logs = JSON.parse(localStorage.getItem("diabetesLogs") || "[]");
  const selectedDate = document.getElementById("date").value;
  
  const dayLogs = logs.filter(log => log.date === selectedDate);
  
  if (dayLogs.length === 0) {
    alert("No logs found for selected date");
    return;
  }

  const averageSugar = dayLogs.reduce((sum, log) => sum + parseFloat(log.sugar), 0) / dayLogs.length;
  
  const summary = `
Daily Summary for ${selectedDate}:
Average Sugar Level: ${averageSugar.toFixed(2)} mg/dL
Number of Readings: ${dayLogs.length}

Detailed Logs:
${dayLogs.map(log => `
Time: ${log.time}
Sugar: ${log.sugar} mg/dL
Meal: ${log.mealType} - ${log.meal}
Insulin: ${log.insulin} ${log.insulinUnits ? `(${log.insulinUnits} units)` : ''}
${log.notes ? `Notes: ${log.notes}` : ''}`).join('\n')}
  `;

  document.getElementById("summaryResponse").innerText = summary;
}

async function analyzeLog() {
  const logs = JSON.parse(localStorage.getItem("diabetesLogs") || "[]");
  if (logs.length === 0) {
    alert("❌ No logs found.");
    return;
  }

  const latest = logs[logs.length - 1];
  const prompt = `
You are a diabetic assistant. Analyze this log and give advice:

Date: ${latest.date}
Sugar: ${latest.sugar}
Meal: ${latest.meal}
Insulin: ${latest.insulin}
Weight: ${latest.weight}

Give suggestions on sugar control and healthy weight gain.
  `;

  document.getElementById("aiResponse").innerText = "⏳ Waiting for AI response...";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${-}` // Fixed the Authorization header format
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || 'API request failed');
    }

    const data = await response.json();
    const message = data?.choices?.[0]?.message?.content || "⚠️ No response from AI.";
    document.getElementById("aiResponse").innerText = message;
  } catch (error) {
    document.getElementById("aiResponse").innerText = `❌ Error: ${error.message}`;
    console.error(error);
  }
}
