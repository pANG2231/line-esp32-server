const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// ===== LINE CONFIG =====
const LINE_TOKEN = process.env.LINE_TOKEN;
const GROUP_ID = process.env.GROUP_ID;

// ===== STORE LAST AVERAGE =====
let lastData = null;

// ===== รับข้อมูลจาก ESP32 =====
app.post("/data", async (req, res) => {
  const { ph, tds, temp, level } = req.body;

  lastData = {
    ph, tds, temp, level,
    time: new Date().toLocaleString("th-TH")
  };

  const message =
`📊 Water Monitor (Avg 20 min)
pH: ${ph.toFixed(2)}
TDS: ${tds.toFixed(0)} ppm
Temp: ${temp.toFixed(1)} °C
Level: ${level.toFixed(1)} %
🕒 ${lastData.time}`;

  try {
    await axios.post(
      "https://api.line.me/v2/bot/message/push",
      {
        to: GROUP_ID,
        messages: [{ type: "text", text: message }]
      },
      {
        headers: {
          Authorization: `Bearer ${LINE_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
    res.send("OK");
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).send("LINE ERROR");
  }
});

// ===== รับ Webhook จาก LINE =====
app.post("/webhook", async (req, res) => {
  const event = req.body.events?.[0];
  if (!event) return res.send("OK");

  // รับเฉพาะข้อความ
  if (event.type === "message" && event.message.type === "text") {
    const text = event.message.text.trim().toLowerCase();

    if (text === "status") {
      let replyText;

      if (lastData) {
        replyText =
`📌 Last Status
pH: ${lastData.ph.toFixed(2)}
TDS: ${lastData.tds.toFixed(0)} ppm
Temp: ${lastData.temp.toFixed(1)} °C
Level: ${lastData.level.toFixed(1)} %
🕒 ${lastData.time}`;
      } else {
        replyText = "⚠️ ยังไม่มีข้อมูลจาก ESP32";
      }

      await axios.post(
        "https://api.line.me/v2/bot/message/reply",
        {
          replyToken: event.replyToken,
          messages: [{ type: "text", text: replyText }]
        },
        {
          headers: {
            Authorization: `Bearer ${LINE_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );
    }
  }

  res.send("OK");
});

app.listen(3000, () => {
  console.log("Server running (Webhook + Data)");
});
