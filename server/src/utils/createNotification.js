const Notification = require('../models/Notification');

/**
 * Create a notification and optionally emit via Socket.io
 */
async function createNotification({
  recipientId,
  senderId,
  type,
  postId,
  message,
  io,
}) {
  try {
    // Don't notify yourself
    if (recipientId.toString() === senderId?.toString()) return null;

    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      post: postId,
      message,
    });

    const populated = await Notification.findById(notification._id)
      .populate('sender', 'name avatarUrl')
      .populate('post', 'title slug');

    // Real-time emit if socket.io is available
    if (io) {
      io.to(recipientId.toString()).emit('notification', populated);
    }

    return populated;
  } catch (error) {
    console.error('Create notification error:', error.message);
    return null;
  }
}

module.exports = createNotification;
