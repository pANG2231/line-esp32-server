import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const LINE_TOKEN = process.env.LINE_TOKEN;
const USER_ID = process.env.LINE_USER_ID;

app.get("/", (req, res) => {
  res.send("Server OK");
});

app.post("/report", async (req, res) => {
  const { temp, ph, tds, level } = req.body;

  const msg = `
📊 รายงานคุณภาพน้ำ
🌡 Temp: ${temp} °C
⚗ pH: ${ph}
💧 TDS: ${tds} ppm
🚰 Level: ${level} %
`;

  await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LINE_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: USER_ID,
      messages: [{ type: "text", text: msg }]
    })
  });

  res.send("OK");
});

app.listen(3000, () => console.log("Server running"));
add line server
