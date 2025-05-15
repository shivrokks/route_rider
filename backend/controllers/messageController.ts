import { Request, Response } from 'express';
import { Message } from '../model/message';
import { APIError } from '../types/errors';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { content, sender } = req.body;

    if (!content || !sender.name || !sender.email) {
      throw new APIError('Message content and sender information are required');
    }

    // Create new message with explicit sender information
    const message = new Message({
      content,
      sender: {
        name: sender.name || 'Unknown User',
        email: sender.email
      },
      timestamp: new Date() // Ensure timestamp is set
    });

    await message.save();

    res.status(201).json({
      success: true,
      data: message,
      message: 'Message sent successfully'
    });
  } catch (error) {
    if (error instanceof APIError) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { limit = 50 } = req.query;
      const messages = await Message.find()
      .sort({ timestamp: 1 }) // Sort by timestamp in ascending order (oldest first)
      .limit(Number(limit))
      .select({ 
        content: 1, 
        'sender.name': 1, 
        'sender.email': 1, 
        timestamp: 1 
      })
      .lean();

    res.status(200).json({
      success: true,
      data: messages,
      message: 'Messages retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
