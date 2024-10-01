// server.js
import express from 'express';
import router from './routes/index.js';  // Make sure to import the router correctly

const app = express();

// Use the router for all routes
app.use('/', router);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
