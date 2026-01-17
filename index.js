const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

// ===== LINE CONFIG =====
const LINE_TOKEN = SpLMnqfhoFTNzU6CfHlr9whdkHwE0MWQKhbYsFX632G/TILkSusfWDKA/VqgQ96SkCUROjfVADCGH/P82ylsZ2bOTfYCALeBkWuyiKgErJfXpXolIMjfzBWOJIOtOvNEkD29u/l4ZNZeVSAez/DyVQdB04t89/1O/w1cDnyilFU=;
const GROUP_ID   = C7061447795097e88eb4b99734c7cfbaf;

// ===== Receive from ESP32 =====
app.post("/report", async (req, res) => {
  const { temp, ph, tds, level } = req.body;

  const msg =
`📊 รายงานคุณภาพน้ำ
🌡 Temp: ${temp} °C
🧪 pH: ${ph}
💧 TDS: ${tds} ppm
📏 Level: ${level} cm`;

  await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LINE_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: GROUP_ID,
      messages: [{ type: "text", text: msg }]
    })
  });

  res.status(200).send("OK");
});

// ===== Health Check =====
app.get("/", (req, res) => res.send("Server OK"));

app.listen(3000, () => console.log("Server running"));
