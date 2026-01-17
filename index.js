import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const LINE_TOKEN = process.env.LINE_TOKEN;
let latest = {};

// ===== Webhook (LINE Verify ต้อง 200) =====
app.post("/webhook", (req, res) => {
  res.status(200).send("OK");
});

// ===== รับข้อมูลจาก ESP32 =====
app.post("/esp32", async (req, res) => {
  latest = req.body;

  const msg =
`📊 รายงานคุณภาพน้ำ
🌡 Temp: ${latest.temp} °C
🧪 pH: ${latest.ph}
💧 TDS: ${latest.tds} ppm
📏 Level: ${latest.level} cm`;

  await pushLine(msg);
  res.send("OK");
});

// ===== ส่ง LINE =====
async function pushLine(text) {
  await fetch("https://api.line.me/v2/bot/message/broadcast", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${LINE_TOKEN}`
    },
    body: JSON.stringify({
      messages: [{ type: "text", text }]
    })
  });
}

app.get("/", (req, res) => res.send("Server OK"));

app.listen(3000, () => console.log("Server running"));
