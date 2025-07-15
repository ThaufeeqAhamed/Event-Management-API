require('dotenv').config();
const express = require('express');
const app = express();
const eventRoutes = require('./routes/events');

app.use(express.json());

// Routes
app.use('/events', eventRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// This is the main entry point for the Event Management API.It sets up the Express server, configures middleware, and defines routes for event management.   
