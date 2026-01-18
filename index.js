const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const LINE_TOKEN = process.env.LINE_TOKEN;
const GROUP_ID = process.env.GROUP_ID;

app.post("/data", async (req, res) => {
  const { ph, tds, temp, level } = req.body;

  const msg =
`🚰 ESP32 Water Monitor
pH: ${ph}
TDS: ${tds} ppm
Temp: ${temp} °C
Water Level: ${level} cm`;

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
