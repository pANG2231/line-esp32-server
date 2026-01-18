const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const LINE_TOKEN = process.env.LINE_TOKEN;
const GROUP_ID = process.env.GROUP_ID;

let buf5 = [];
let buf20 = [];
let lastAuto = Date.now();

function avg(buf) {
  const s = buf.reduce((a,b)=>({
    ph:a.ph+b.ph, tds:a.tds+b.tds,
    temp:a.temp+b.temp, level:a.level+b.level
  }),{ph:0,tds:0,temp:0,level:0});

  return {
    ph:s.ph/buf.length,
    tds:s.tds/buf.length,
    temp:s.temp/buf.length,
    level:s.level/buf.length
  };
}

// ===== ESP32 =====
app.post("/data",(req,res)=>{
  buf5.push(req.body);
  buf20.push(req.body);

  if (buf5.length > 60) buf5.shift();
  if (buf20.length > 240) buf20.shift();

  if (Date.now()-lastAuto>20*60*1000 && buf20.length>=60){
    lastAuto=Date.now();
    const a=avg(buf20);

    axios.post("https://api.line.me/v2/bot/message/push",{
      to:GROUP_ID,
      messages:[{type:"text",text:
`📊 รายงานอัตโนมัติ
pH: ${a.ph.toFixed(2)}
TDS: ${a.tds.toFixed(0)} ppm
Temp: ${a.temp.toFixed(1)} °C
Water: ${a.level.toFixed(1)} cm`}]
    },{headers:{Authorization:`Bearer ${LINE_TOKEN}`}});

    buf20=[];
  }
  res.send("OK");
});

// ===== LINE =====
app.post("/webhook",async(req,res)=>{
  console.log("WEBHOOK HIT");

  const e=req.body.events?.[0];
  if(!e) return res.send("OK");

  if(e.message?.text?.toLowerCase()==="status"){
    let text="⚠️ ยังเก็บข้อมูลไม่ครบ 5 นาที";
    if(buf5.length>=60){
      const a=avg(buf5);
      text=
`📌 Status (5 นาที)
pH: ${a.ph.toFixed(2)}
TDS: ${a.tds.toFixed(0)} ppm
Temp: ${a.temp.toFixed(1)} °C
Water: ${a.level.toFixed(1)} cm`;
    }

    await axios.post("https://api.line.me/v2/bot/message/reply",{
      replyToken:e.replyToken,
      messages:[{type:"text",text}]
    },{headers:{Authorization:`Bearer ${LINE_TOKEN}`}})
  }
  res.send("OK");
});

app.listen(3000,()=>console.log("Server running"));
