const express = require('express');
const router = express.Router();

const users = new Set();

router.post('/signup', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username is required' });
  if (users.has(username)) return res.status(400).json({ error: 'Username already exists' });

  users.add(username);
  res.json({ message: 'Signup successful', username });
});

module.exports = router;
