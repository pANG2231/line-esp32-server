const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const LINE_TOKEN = process.env.LINE_TOKEN; // Channel Access Token
const GROUP_ID   = process.env.LINE_GROUP_ID;

app.post("/report", async (req, res) => {
  const { reason, ph, tds, temp, level } = req.body;

  const message =
`💧 Water Monitoring
━━━━━━━━━━━━━━
📌 ${reason}
🌡 Temp : ${temp} °C
🧪 pH   : ${ph}
💦 TDS  : ${tds} ppm
📏 Level: ${level} cm
━━━━━━━━━━━━━━`;

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
    console.error(err.response?.data || err.message);
    res.status(500).send("LINE ERROR");
  }
});

app.listen(3000, () => console.log("LINE Messaging API Server Running"));
