import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const LINE_TOKEN = process.env.LINE_TOKEN; // Channel Access Token
const USER_ID = process.env.LINE_USER_ID;  // User / Group ID

app.get("/", (req, res) => {
  res.send("LINE ESP32 Server OK");
});

app.post("/notify", async (req, res) => {
  try {
    const { message } = req.body;

    const body = {
      to: USER_ID,
      messages: [
        {
          type: "text",
          text: message
        }
      ]
    };

    const r = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINE_TOKEN}`
      },
      body: JSON.stringify(body)
    });

    const data = await r.text();
    console.log("LINE:", data);

    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
