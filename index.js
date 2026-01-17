import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const LINE_TOKEN = process.env.LINE_TOKEN;
const USER_ID = process.env.LINE_USER_ID;

// health check
app.get("/", (req, res) => {
  res.send("Server OK");
});

// ESP32 POST ข้อมูลมา
app.post("/report", async (req, res) => {
  try {
    const { temp, ph, tds, level } = req.body;

    const msg =
`📊 รายงานระบบน้ำ
🌡 Temp: ${temp} °C
🧪 pH: ${ph}
💧 TDS: ${tds} ppm
📏 Level: ${level} %`;

    await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LINE_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: USER_ID,
        messages: [{ type: "text", text: msg }]
      })
    });

    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "send line failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
