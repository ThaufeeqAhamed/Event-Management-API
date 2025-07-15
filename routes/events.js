const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Specific routes for events
router.get('/upcoming', eventController.getUpcomingEvents);
router.get('/:id/stats', eventController.getEventStats);

// Generic routes with parameters 
router.post('/', eventController.createEvent);
router.get('/:id', eventController.getEventDetails);
router.post('/:id/register', eventController.registerUser);
router.delete('/:id/register/:userId', eventController.cancelRegistration);

module.exports = router;
