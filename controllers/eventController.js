const pool = require('../db/db');
exports.createEvent = async (req, res) => {
  const { title, date_time, location, capacity } = req.body;

  // Basic validation
  if (!title || !date_time || !location || !capacity) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (capacity <= 0 || capacity > 1000) {
    return res.status(400).json({ error: "Capacity must be between 1 and 1000" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO events (title, date_time, location, capacity)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [title, date_time, location, capacity]
    );

    res.status(201).json({ message: "Event created successfully", eventId: result.rows[0].id });
  } catch (err) {
    console.error("Error inserting event:", err);
    res.status(500).json({ error: "Server error while creating event" });
  }
};

/* This controller handles the creation of events.It validates the input and interacts with the database to insert a new event.
 and get event details along with registered users*/

exports.getEventDetails = async (req, res) => {
  const eventId = req.params.id;

  try {
    // Get event by ID
    const eventResult = await pool.query(
      `SELECT * FROM events WHERE id = $1`,
      [eventId]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const event = eventResult.rows[0];

    // Get registered users for this event
    const usersResult = await pool.query(
      `SELECT u.id, u.name, u.email
       FROM users u
       JOIN registrations r ON u.id = r.user_id
       WHERE r.event_id = $1`,
      [eventId]
    );

    // Send back event & users
    res.status(200).json({
      ...event,
      registered_users: usersResult.rows,
    });

  } catch (err) {
    console.error("Error fetching event details:", err);
    res.status(500).json({ error: "Server error while fetching event" });
  }
};

/* This controller fetches event details including registered users.
 It retrieves the event by ID and joins with the registrations table to get user details.
 Register a user for an event*/

exports.registerUser = async (req, res) => {
  const eventId = req.params.id;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // 1. Check if event exists and is in the future
    const eventResult = await pool.query(
      `SELECT * FROM events WHERE id = $1`,
      [eventId]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const event = eventResult.rows[0];

    const now = new Date();
    if (new Date(event.date_time) < now) {
      return res.status(400).json({ error: "Cannot register for past events" });
    }

    // 2. Check if user already registered
    const duplicateCheck = await pool.query(
      `SELECT * FROM registrations WHERE user_id = $1 AND event_id = $2`,
      [user_id, eventId]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({ error: "User already registered for this event" });
    }

    // 3. Check if event is full
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM registrations WHERE event_id = $1`,
      [eventId]
    );
    const registeredCount = parseInt(countResult.rows[0].count);

    if (registeredCount >= event.capacity) {
      return res.status(400).json({ error: "Event is full" });
    }

    // 4. Register the user
    await pool.query(
      `INSERT INTO registrations (user_id, event_id) VALUES ($1, $2)`,
      [user_id, eventId]
    );

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
};

// Cancel an user's registration
exports.cancelRegistration = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.params.userId;

  try {
    // Check if registration exists
    const check = await pool.query(
      `SELECT * FROM registrations WHERE event_id = $1 AND user_id = $2`,
      [eventId, userId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "User is not registered for this event" });
    }

    // Delete the registration
    await pool.query(
      `DELETE FROM registrations WHERE event_id = $1 AND user_id = $2`,
      [eventId, userId]
    );

    res.status(200).json({ message: "Registration cancelled successfully" });

  } catch (err) {
    console.error("Error cancelling registration:", err);
    res.status(500).json({ error: "Server error during cancellation" });
  }
};

/* This controller handles user registration for events.
 It checks if the event exists, if the user is already registered, and if the event
 List upcoming events sorted by date and location */

exports.getUpcomingEvents = async (req, res) => {
  try {
    const now = new Date();

    const result = await pool.query(
      `SELECT * FROM events
       WHERE date_time > $1
       ORDER BY date_time ASC, location ASC`,
      [now]
    );

    res.status(200).json({ upcoming_events: result.rows });

  } catch (err) {
    console.error("Error fetching upcoming events:", err);
    res.status(500).json({ error: "Server error while fetching events" });
  }
};

/* This controller retrieves all upcoming events, sorted by date and location.
 It filters out past events and returns the list in ascending order.*/

exports.getEventStats = async (req, res) => {
  const eventId = req.params.id;

  try {
    // Step 1: Fetch the event
    const eventResult = await pool.query(
      `SELECT capacity FROM events WHERE id = $1`,
      [eventId]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const capacity = eventResult.rows[0].capacity;

    // Step 2: Count total registrations
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM registrations WHERE event_id = $1`,
      [eventId]
    );

    const totalRegistrations = parseInt(countResult.rows[0].count);
    const remainingCapacity = capacity - totalRegistrations;
    const percentUsed = ((totalRegistrations / capacity) * 100).toFixed(2);

    // Step 3: Return stats
    res.status(200).json({
      total_registrations: totalRegistrations,
      remaining_capacity: remainingCapacity,
      percent_used: `${percentUsed}%`
    });

  } catch (err) {
    console.error("Error fetching event stats:", err);
    res.status(500).json({ error: "Server error while fetching stats" });
  }
};

/* This controller fetches statistics for a specific event.
 It retrieves the event's capacity, counts the total registrations, and calculates remaining capacity and percentage.*/