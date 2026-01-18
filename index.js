import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json()); // สำคัญมาก

const PORT = process.env.PORT || 3000;
const LINE_TOKEN = process.env.LINE_TOKEN; // Channel Access Token

/* =========================
   LINE WEBHOOK (สำคัญ)
   ========================= */
app.post("/webhook", (req, res) => {
  console.log("LINE webhook received");
  res.status(200).send("OK");
});

/* =========================
   ESP32 → เรียกส่งข้อความ
   ========================= */
app.post("/notify", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "No message" });
  }

  try {
    const lineRes = await fetch("https://api.line.me/v2/bot/message/broadcast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LINE_TOKEN}`
      },
      body: JSON.stringify({
        messages: [{ type: "text", text: message }]
      })
    });

    const data = await lineRes.text();
    console.log("LINE response:", data);

    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "LINE send failed" });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
