const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const LINE_TOKEN = process.env.LINE_TOKEN;
const GROUP_ID = process.env.GROUP_ID;

app.post("/data", async (req, res) => {
  const { ph, tds, temp, level } = req.body;

  const message =
`📊 Water Monitor (Avg 20 min)
pH: ${ph.toFixed(2)}
TDS: ${tds.toFixed(0)} ppm
Temp: ${temp.toFixed(1)} °C
Level: ${level.toFixed(1)} %`;

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

app.listen(3000, () => {
  console.log("Render server running");
});
