import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const LINE_TOKEN = process.env.LINE_CHANNEL_TOKEN;
const LINE_USER_ID = process.env.LINE_USER_ID;

/* ===== HEALTH CHECK ===== */
app.get("/", (req, res) => {
  res.send("✅ LINE ESP32 Server is running");
});

/* ===== RECEIVE FROM ESP32 ===== */
app.post("/notify", async (req, res) => {
  try {
    const {
      title,
      temp,
      tds,
      ph,
      dist
    } = req.body;

    const message =
`━━━━━━━━━━━━━━
📡 ${title}
━━━━━━━━━━━━━━
🌡 อุณหภูมิ : ${temp.toFixed(1)} °C
💧 TDS        : ${tds.toFixed(0)} ppm
⚗ pH         : ${ph.toFixed(2)}
📏 ระดับน้ำ  : ${dist.toFixed(1)} cm
━━━━━━━━━━━━━━
⏱ ${new Date().toLocaleString("th-TH")}
`;

    await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LINE_TOKEN}`
      },
      body: JSON.stringify({
        to: LINE_USER_ID,
        messages: [
          {
            type: "text",
            text: message
          }
        ]
      })
    });

    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
