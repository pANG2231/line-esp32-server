const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const LINE_TOKEN = process.env.LINE_TOKEN;
const GROUP_ID = process.env.GROUP_ID;

// ===== BUFFER =====
let buffer5min = [];
let buffer20min = [];
let lastReport = Date.now();

function avg(buffer) {
  const sum = buffer.reduce(
    (a, b) => ({
      ph: a.ph + b.ph,
      tds: a.tds + b.tds,
      temp: a.temp + b.temp,
      level: a.level + b.level
    }),
    { ph: 0, tds: 0, temp: 0, level: 0 }
  );

  return {
    ph: sum.ph / buffer.length,
    tds: sum.tds / buffer.length,
    temp: sum.temp / buffer.length,
    level: sum.level / buffer.length
  };
}

// ===== ESP32 ส่งข้อมูล =====
app.post("/data", async (req, res) => {
  const data = req.body;
  buffer5min.push(data);
  buffer20min.push(data);

  if (buffer5min.length > 60) buffer5min.shift();
  if (buffer20min.length > 240) buffer20min.shift();

  // ===== ส่งอัตโนมัติทุก 20 นาที =====
  if (Date.now() - lastReport >= 20 * 60 * 1000 && buffer20min.length >= 10) {
    lastReport = Date.now();
    const a = avg(buffer20min);

    const msg =
`📊 รายงานอัตโนมัติ (20 นาที)
pH: ${a.ph.toFixed(2)}
TDS: ${a.tds.toFixed(0)} ppm
Temp: ${a.temp.toFixed(1)} °C
Level: ${a.level.toFixed(1)} %`;

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

    buffer20min = [];
  }

  res.send("OK");
});

// ===== LINE Webhook =====
app.post("/webhook", async (req, res) => {
  const event = req.body.events?.[0];
  if (!event) return res.send("OK");

  if (event.type === "message" && event.message.type === "text") {
    if (event.message.text.trim().toLowerCase() === "status") {
      let reply;

      if (buffer5min.length >= 5) {
        const a = avg(buffer5min);
        reply =
`📌 Status (เฉลี่ย 5 นาที)
pH: ${a.ph.toFixed(2)}
TDS: ${a.tds.toFixed(0)} ppm
Temp: ${a.temp.toFixed(1)} °C
Level: ${a.level.toFixed(1)} %`;
      } else {
        reply = "⚠️ ข้อมูลยังไม่ครบ 5 นาที";
      }

      await axios.post(
        "https://api.line.me/v2/bot/message/reply",
        {
          replyToken: event.replyToken,
          messages: [{ type: "text", text: reply }]
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

app.listen(3000, () => console.log("Server running"));
