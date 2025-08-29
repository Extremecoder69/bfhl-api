require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Personal details
const FULL_NAME = process.env.FULL_NAME || 'your name';
const DOB_DDMMYYYY = process.env.DOB_DDMMYYYY || 'ddmmyyyy';
const EMAIL = process.env.EMAIL || 'you@example.com';
const ROLL_NUMBER = process.env.ROLL_NUMBER || 'ROLL123';

const userId = `${String(FULL_NAME).trim().toLowerCase().replace(/\s+/g, '_')}_${DOB_DDMMYYYY}`;

const isAlpha = (s) => /^[A-Za-z]+$/.test(s);
const isNumeric = (s) => /^\d+$/.test(s);

function buildConcatString(tokens) {
  const letters = [];
  for (const t of tokens) {
    const s = String(t ?? '');
    for (const ch of s) if (/[A-Za-z]/.test(ch)) letters.push(ch);
  }
  letters.reverse();
  return letters
    .map((ch, i) => (i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()))
    .join('');
}

app.post('/bfhl', (req, res) => {
  try {
    const data = req.body && req.body.data;
    if (!Array.isArray(data)) {
      return res.status(400).json({
        is_success: false,
        user_id: userId,
        email: EMAIL,
        roll_number: ROLL_NUMBER,
        message: 'Invalid payload: "data" must be an array.'
      });
    }

    const odd_numbers = [];
    const even_numbers = [];
    const alphabets = [];
    const special_characters = [];
    let sum = 0;

    for (const item of data) {
      const s = String(item);
      if (isNumeric(s)) {
        const n = parseInt(s, 10);
        (n % 2 === 0 ? even_numbers : odd_numbers).push(s);
        sum += n;
      } else if (isAlpha(s)) {
        alphabets.push(s.toUpperCase());
      } else {
        if (s.length) special_characters.push(s);
      }
    }

    return res.status(200).json({
      is_success: true,
      user_id: userId,
      email: EMAIL,
      roll_number: ROLL_NUMBER,
      odd_numbers,
      even_numbers,
      alphabets,
      special_characters,
      sum: String(sum),
      concat_string: buildConcatString(data)
    });
  } catch (err) {
    return res.status(500).json({
      is_success: false,
      user_id: userId,
      email: EMAIL,
      roll_number: ROLL_NUMBER,
      message: 'Server error'
    });
  }
});

app.get("/", (req, res) => {
  res.send("✅ BFHL API is live! Use POST /bfhl with JSON data to test.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
