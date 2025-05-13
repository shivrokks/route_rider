import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../model/user';
import { APIError } from '../types/errors';

// Create a dynamic schema for user-specific data
const createUserDataSchema = () => {
  return new mongoose.Schema({
    userId: String,
    userData: {
      fullName: String,
      email: String,
      phoneNumber: String
    },
    settings: {
      notifications: {
        emailNotifications: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: true },
        notifyBeforeStops: { type: Number, default: 3 }
      },
      appSettings: {
        locationServices: { type: Boolean, default: true },
        distanceUnits: { type: String, default: 'km' },
        autoRefreshMap: { type: Boolean, default: true }
      }
    }
  }, { timestamps: true });
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phoneNumber } = req.body;

    if (!email || !phoneNumber) {
      throw new APIError('Email and phone number are required');
    }

    // First, update or create the user in the main users collection
    const user = await User.findOneAndUpdate(
      { email },
      { fullName, phoneNumber },
      { new: true, upsert: true }
    );

    // Create a phone number specific collection
    const sanitizedPhoneNumber = phoneNumber.replace(/[^0-9]/g, '');
    const collectionName = `userData_${sanitizedPhoneNumber}`;

    try {
      // Create or get the model for this collection
      const UserDataModel = mongoose.models[collectionName] || 
        mongoose.model(collectionName, createUserDataSchema());

      // Create or update user specific data including profile information
      const userData = await UserDataModel.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          userData: {
            fullName,
            email,
            phoneNumber
          },
          settings: {
            notifications: {
              emailNotifications: true,
              pushNotifications: true,
              notifyBeforeStops: 3
            },
            appSettings: {
              locationServices: true,
              distanceUnits: 'km',
              autoRefreshMap: true
            }
          }
        },
        { upsert: true, new: true }
      );

      res.status(200).json({
        success: true,
        data: {
          user,
          userData,
          collectionName
        },
        message: 'Profile and user data collection created successfully'
      });
    } catch (error) {
      console.error('Error creating user collection:', error);
      throw new Error('Failed to create user collection');
    }
  } catch (error) {
    if (error instanceof APIError) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    if (!email) {
      throw new APIError('Email is required');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new APIError('User not found');
    }

    // Get user data from their specific collection
    const sanitizedPhoneNumber = user.phoneNumber.replace(/[^0-9]/g, '');
    const collectionName = `userData_${sanitizedPhoneNumber}`;
    
    try {
      const UserDataModel = mongoose.models[collectionName] || 
        mongoose.model(collectionName, createUserDataSchema());
      
      const userData = await UserDataModel.findOne({ userId: user._id });

      res.status(200).json({
        success: true,
        data: {
          ...userData?.userData || {},
          settings: userData?.settings || {}
        },
        message: 'Profile retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to user collection data if specific collection fails
      res.status(200).json({
        success: true,
        data: {
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          email: user.email
        },
        message: 'Profile retrieved from main collection'
      });
    }
  } catch (error) {
    if (error instanceof APIError) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};