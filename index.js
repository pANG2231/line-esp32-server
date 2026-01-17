const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ===== CONFIG =====
const LINE_TOKEN = process.env.LINE_TOKEN;   // ใส่ใน Render Env
const GROUP_ID   = process.env.GROUP_ID;     // ใส่ใน Render Env

// ===== Health Check =====
app.get("/", (req, res) => {
  res.send("LINE ESP32 Server is running ✅");
});

// ===== ESP32 ส่งมา =====
app.post("/notify", async (req, res) => {
  const message = req.body.message;

  if (!message) {
    return res.status(400).json({ error: "No message" });
  }

  try {
    await axios.post(
      "https://api.line.me/v2/bot/message/push",
      {
        to: GROUP_ID,
        messages: [
          {
            type: "text",
            text: message
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${LINE_TOKEN}`
        }
      }
    );

    res.json({ status: "sent" });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "LINE send failed" });
  }
});

// ===== PORT =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
