const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: "Hei șefule, prea multe requesturi! Dă-i mai încet...",
});

module.exports = limiter;
