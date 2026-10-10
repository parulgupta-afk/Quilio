const Notification = require('../models/Notification');

async function createNotification({ recipient, recipientId, sender, senderId, type, post, postId, message, io }) {
  try {
    const targetRecipient = recipient || recipientId;
    const targetSender = sender || senderId;
    const targetPost = post || postId;

    if (!targetRecipient || !type) return null;

    // Do not notify self
    if (targetSender && targetRecipient.toString() === targetSender.toString()) {
      return null;
    }

    const doc = await Notification.create({
      recipient: targetRecipient,
      sender: targetSender || undefined,
      type,
      post: targetPost || undefined,
      message: message || '',
    });

    const populated = await Notification.findById(doc._id)
      .populate('sender', 'name avatarUrl')
      .populate('post', 'title slug');

    const socketServer = io || global.io;
    const recipientStr = targetRecipient.toString();
    if (socketServer) {
      socketServer.to(`user:${recipientStr}`).emit('notification', populated);
    }
    if (global.io && global.io !== socketServer) {
      global.io.to(`user:${recipientStr}`).emit('notification', populated);
    }
    return populated;
  } catch (err) {
    console.error('createNotification error:', err.message);
    return null;
  }
}

module.exports = createNotification;
module.exports.createNotification = createNotification;
