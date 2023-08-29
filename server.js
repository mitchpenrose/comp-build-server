import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';

const app = express();
const port = 5000;

const __filename = fileURLToPath(import.meta.url);

let winRateData = null

let positionToWinrates = null

let championWinRateData = null

fs.readFile('Aug28MatchupWinrateResults.json', (err, data) => {
  if (err) throw err;
  winRateData = JSON.parse(data)
  positionToWinrates = new Map() 
  positionToWinrates.set("TOP", [])
  positionToWinrates.set("JUNGLE", [])
  positionToWinrates.set("MID", [])
  positionToWinrates.set("ADC", [])
  positionToWinrates.set("SUPPORT", [])
  Object.entries(winRateData).forEach(([key,]) => {
    const data = winRateData[key]["TEAM_"+key]
    positionToWinrates.get(key.split("_")[0]).push({key: key.split("_")[1], wins: data.wins, losses: data.losses, pct: (data.wins/(data.wins+data.losses))})
  })
  Array.from(positionToWinrates.keys()).forEach((key) => {
    positionToWinrates.get(key).sort((a,b) => b.pct - a.pct)
  })
  positionToWinrates = Object.fromEntries(positionToWinrates)
})

fs.readFile('Aug28ChampionMatchupWinrateResults.json', (err, data) => {
  if (err) throw err;
  championWinRateData = JSON.parse(data)
})

// app.use(cors())

app.use(cors({
  origin: 'https://compbuilder.gg'
}));

app.get('/api/data', (req, res) => {
  console.log(req.query)
  res.send(winRateData[req.query['id']])
});

app.get('/api/winrates', (req, res) => {
  console.log('winrates')
  res.send(positionToWinrates)
})

app.get('/api/champData', (req, res) => {
  console.log(req.query)
  res.send(championWinRateData[req.query['id']])
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
