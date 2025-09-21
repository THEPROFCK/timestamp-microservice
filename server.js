const express = require('express');
const path = require('path');
const app = express();

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Root route → serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// API route for current time
app.get('/api', (req, res) => {
  const now = new Date();
  res.json({
    unix: now.getTime(),
    utc: now.toUTCString()
  });
});

// API route with date parameter
app.get('/api/:date', (req, res) => {
  const dateParam = req.params.date;

  let date;
  if (/^\d+$/.test(dateParam)) {
    let ts = parseInt(dateParam);
    if (dateParam.length === 10) ts *= 1000; // seconds → ms
    date = new Date(ts);
  } else {
    date = new Date(dateParam);
  }

  if (date.toString() === 'Invalid Date') {
    return res.json({ error: 'Invalid Date' });
  }

  res.json({
    unix: date.getTime(),
    utc: date.toUTCString()
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
