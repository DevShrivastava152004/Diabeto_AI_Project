// Auto-fill today's date
window.onload = function () {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("date").value = today;
};

function saveLog() {
  const log = {
    date: document.getElementById("date").value,
    sugar: document.getElementById("sugar").value,
    meal: document.getElementById("meal").value,
    insulin: document.getElementById("insulin").value,
    weight: document.getElementById("weight").value,
  };

  const logs = JSON.parse(localStorage.getItem("diabetesLogs") || "[]");
  logs.push(log);
  localStorage.setItem("diabetesLogs", JSON.stringify(logs));

  alert("✅ Log saved successfully!");
  document.getElementById("sugar").value = "";
  document.getElementById("meal").value = "";
  document.getElementById("insulin").value = "None";
  document.getElementById("weight").value = "";
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
        Authorization: "Bearer YOUR_API_KEY_HERE", // ✅ Replace with your OpenAI key
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const message =
      data?.choices?.[0]?.message?.content || "⚠️ No response from AI.";
    document.getElementById("aiResponse").innerText = message;
  } catch (error) {
    document.getElementById("aiResponse").innerText =
      "❌ Error fetching AI response.";
    console.error(error);
  }
}
