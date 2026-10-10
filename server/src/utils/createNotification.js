const Notification = require('../models/Notification');

/**
 * Persist a notification and emit to the recipient's authenticated socket room.
 * Room name is always derived from recipient id — never from client input.
 */
async function createNotification({ recipient, sender, type, post, message }) {
  try {
    if (!recipient || !type) return null;

    const doc = await Notification.create({
      recipient,
      sender: sender || undefined,
      type,
      post: post || undefined,
      message: message || '',
    });

    const populated = await Notification.findById(doc._id)
      .populate('sender', 'name avatarUrl')
      .populate('post', 'title slug');

    const io = global.io;
    if (io) {
      io.to(`user:${recipient.toString()}`).emit('notification', populated);
    }

    return populated;
  } catch (err) {
    console.error('createNotification error:', err.message);
    return null;
  }
}

module.exports = { createNotification };
