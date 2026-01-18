const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const LINE_TOKEN = process.env.LINE_TOKEN;
const GROUP_ID   = process.env.GROUP_ID;

app.post("/data", async (req, res) => {
  const { ph, tds, temp, level } = req.body;

  const time = new Date().toLocaleString("th-TH");

  const msg =
`🚰 ระบบตรวจวัดคุณภาพน้ำ
━━━━━━━━━━━━━━━━━━
🧪 pH          : ${ph.toFixed(2)}
💧 TDS         : ${tds.toFixed(0)} ppm
🌡️ อุณหภูมิ    : ${temp.toFixed(1)} °C
📏 ระดับน้ำ    : ${level.toFixed(1)} cm
━━━━━━━━━━━━━━━━━━
⏰ เวลา ${time}`;

  await axios.post(
    "https://api.line.me/v2/bot/message/push",
    {
      to: GROUP_ID,
      messages: [{ type: "text", text: msg }]
    },
    {
      headers: {
        Authorization: `Bearer ${LINE_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );

  res.send("OK");
});

app.listen(3000, () => console.log("Server running"));
