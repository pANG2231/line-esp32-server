import express from "express";

const app = express();
app.use(express.json());

// หน้า root เอาไว้เช็กว่า server ทำงาน
app.get("/", (req, res) => {
  res.send("Server OK");
});

// === LINE Webhook ===
app.post("/webhook", (req, res) => {
  console.log("LINE webhook received");
  console.log(JSON.stringify(req.body, null, 2));

  // ต้องตอบ 200 กลับไปเสมอ
  res.status(200).send("OK");
});

// Render ใช้ PORT จาก env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
