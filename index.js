const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const LINE_TOKEN = process.env.LINE_TOKEN;
const USER_ID = process.env.LINE_USER_ID;

app.post("/report", async (req, res) => {
  const { ph, tds, temp, water } = req.body;

  const message =
`📊 รายงานค่าน้ำ (เฉลี่ย 20 นาที)
pH: ${ph}
TDS: ${tds} ppm
Temp: ${temp} °C
Water Level: ${water} cm`;

  try {
    await axios.post(
      "https://api.line.me/v2/bot/message/push",
      {
        to: USER_ID,
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
    res.status(500).send("ERROR");
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
