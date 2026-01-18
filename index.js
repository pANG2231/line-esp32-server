import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const LINE_TOKEN = process.env.LINE_TOKEN;
const LINE_USER_ID = process.env.LINE_USER_ID;

app.get("/", (req, res) => {
  res.send("LINE ESP32 Server OK");
});

app.post("/notify", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "message missing" });
    }

    const payload = {
      to: LINE_USER_ID,
      messages: [
        {
          type: "text",
          text: message
        }
      ]
    };

    const lineRes = await fetch(
      "https://api.line.me/v2/bot/message/push",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${LINE_TOKEN}`
        },
        body: JSON.stringify(payload)
      }
    );

    const text = await lineRes.text();
    res.status(200).send(text);

  } catch (err) {
    console.error(err);
    res.status(500).send("LINE ERROR");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
