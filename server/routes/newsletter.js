import express from 'express';
import db from '../database/connection.js';

const router = express.Router();

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if email already exists and is active
    const [existingSubscriber] = await db.query(
      'SELECT id, is_active FROM newsletter_subscribers WHERE email = ?',
      [email]
    );

    if (existingSubscriber) {
      if (existingSubscriber.is_active) {
        return res.status(409).json({ error: 'Email is already subscribed to newsletter' });
      } else {
        // Reactivate subscription
        await db.query(
          'UPDATE newsletter_subscribers SET is_active = 1, unsubscribed_at = NULL WHERE email = ?',
          [email]
        );
        return res.json({ message: 'Successfully resubscribed to newsletter' });
      }
    }

    // Add new subscriber
    await db.query(
      'INSERT INTO newsletter_subscribers (email, subscription_source) VALUES (?, ?)',
      [email, 'website']
    );

    res.status(201).json({ message: 'Successfully subscribed to newsletter' });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await db.query(
      'UPDATE newsletter_subscribers SET is_active = 0, unsubscribed_at = CURRENT_TIMESTAMP WHERE email = ? AND is_active = 1',
      [email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Email not found or already unsubscribed' });
    }

    res.json({ message: 'Successfully unsubscribed from newsletter' });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get subscriber count (for admin purposes)
router.get('/count', async (req, res) => {
  try {
    const [result] = await db.query(
      'SELECT COUNT(*) as total_subscribers FROM newsletter_subscribers WHERE is_active = 1'
    );

    res.json({ total_subscribers: result.total_subscribers });
  } catch (error) {
    console.error('Newsletter count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;