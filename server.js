// index.js
const express = require("express");
const path = require("path");

const app = express();

// Serve static files from "public" (index.html, style.css)
app.use(express.static(path.join(__dirname, "public")));

// Helper: build JSON response for a valid Date object
function buildDateResponse(dateObj) {
  return {
    unix: dateObj.getTime(),
    utc: dateObj.toUTCString(),
  };
}

// Route: current time (handles "/api" and "/api/")
app.get(["/api", "/api/"], (req, res) => {
  const now = new Date();
  res.json(buildDateResponse(now));
});

// Route: date param provided
app.get("/api/:date", (req, res) => {
  let { date } = req.params;

  // decode if encoded (helps with spaces or encoded strings)
  try {
    date = decodeURIComponent(date);
  } catch (e) {
    // ignore decode errors and continue with raw value
  }

  let parsedDate;

  // If the date string is strictly digits (positive or negative), treat as timestamp.
  // Use regex to allow optional leading '-' for negative timestamps.
  if (/^-?\d+$/.test(date)) {
    // Numeric timestamp
    // Convert to number
    const num = Number(date);

    // Determine whether the timestamp is in seconds (10 digits) or milliseconds (13+ digits)
    // More robust approach: if absolute value is < 1e12 treat as seconds (reasonable heuristic),
    // else treat as milliseconds. But we'll follow the common FreeCodeCamp check:
    // - if length === 10 => seconds -> *1000
    // - otherwise assume milliseconds
    if (date.length === 10 || (date.length === 11 && date.startsWith("-") && date.length - 1 === 10)) {
      parsedDate = new Date(num * 1000);
    } else {
      parsedDate = new Date(num);
    }
  } else {
    // Non-numeric: parse as date string (e.g., "2015-12-25")
    parsedDate = new Date(date);
  }

  if (parsedDate.toString() === "Invalid Date") {
    return res.json({ error: "Invalid Date" });
  }

  return res.json(buildDateResponse(parsedDate));
});

// Ensure root serves index.html even if static middleware misses (explicit fallback)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// If file executed directly, start server
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

// Export app for tests or external server wrappers
module.exports = app;
