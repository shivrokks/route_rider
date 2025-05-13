import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../model/user';
import { Stop } from '../model/stop';
import { APIError } from '../types/errors';

interface MongoError extends Error {
  code?: number;
}

export const getStops = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.params;

    if (!phoneNumber) {
      throw new APIError('Phone number is required');
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      throw new APIError('User not found');
    }

    const stops = await Stop.find({ userId: user._id });

    res.status(200).json({
      success: true,
      data: stops,
      message: 'Stops retrieved successfully'
    });
  } catch (error: unknown) {
    handleError(error, res);
  }
};

export const addStop = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, stopName, busRoute } = req.body;

    if (!phoneNumber || !stopName || !busRoute) {
      throw new APIError('Phone number, stop name and bus route are required');
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      throw new APIError('User not found');
    }

    const existingStop = await Stop.findOne({
      userId: user._id,
      name: stopName
    });

    if (existingStop) {
      throw new APIError('Stop already exists');
    }

    const stop = new Stop({
      userId: user._id,
      name: stopName,
      busRoute,
      notifications: {
        enablePushNotifications: true,
        enableSmsNotifications: false
      }
    });

    await stop.save();

    res.status(201).json({
      success: true,
      data: stop,
      message: 'Stop added successfully'
    });
  } catch (error: unknown) {
    handleError(error, res);
  }
};

// Add a helper function to handle errors consistently
const handleError = (error: unknown, res: Response) => {
  if (error instanceof APIError) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  } else if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(error.errors).map(err => err.message)
    });
  } else if ((error as MongoError).code === 11000) {
    res.status(400).json({
      success: false,
      message: 'Stop already exists'
    });
  } else {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update the remaining controller methods to use the new error handler
export const removeStop = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.params;
    const { stopName } = req.body;

    if (!phoneNumber || !stopName) {
      throw new APIError('Phone number and stop name are required');
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      throw new APIError('User not found');
    }

    const result = await Stop.findOneAndDelete({ 
      userId: user._id,
      name: stopName 
    });

    if (!result) {
      throw new APIError('Stop not found');
    }

    res.status(200).json({
      success: true,
      message: 'Stop removed successfully'
    });
  } catch (error: unknown) {
    handleError(error, res);
  }
};

export const updateStopPreferences = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, stopName } = req.params;
    const { enablePushNotifications, enableSmsNotifications } = req.body;

    if (!phoneNumber || !stopName) {
      throw new APIError('Phone number and stop name are required');
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      throw new APIError('User not found');
    }

    const result = await Stop.findOneAndUpdate(
      { 
        userId: user._id,
        name: stopName 
      },
      {
        $set: {
          'notifications.enablePushNotifications': enablePushNotifications,
          'notifications.enableSmsNotifications': enableSmsNotifications
        }
      },
      { new: true }
    );

    if (!result) {
      throw new APIError('Stop not found');
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'Stop preferences updated successfully'
    });
  } catch (error: unknown) {
    handleError(error, res);
  }
};