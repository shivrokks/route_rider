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
  console.log('getUserProfile called with query:', req.query);
  
  try {
    const { email } = req.query;

    if (!email) {
      console.error('No email provided in request');
      throw new APIError('Email is required');
    }

    // Trim and validate email
    const userEmail = (email as string).trim().toLowerCase();
    console.log('Processing email:', userEmail);
    
    if (!userEmail.includes('@') || !userEmail.includes('.')) {
      console.error('Invalid email format:', userEmail);
      throw new APIError('Please provide a valid email address');
    }

    // Try to find user by email
    console.log('Looking up user in database...');
    let user;
    
    try {
      user = await User.findOne({ email: userEmail });
      console.log('User lookup result:', user ? 'found' : 'not found');
    } catch (dbError) {
      console.error('Database error during user lookup:', dbError);
      throw new Error('Failed to query user database');
    }
    
    // If user doesn't exist, create a new one with default values
    if (!user) {
      console.log('Creating new user with email:', userEmail);
      try {
        user = await User.create({
          email: userEmail,
          fullName: userEmail.split('@')[0], // Use email prefix as default name
          phoneNumber: '' // Empty phone number by default
        });
        console.log('New user created:', user);
      } catch (createError) {
        console.error('Error creating new user:', createError);
        throw new Error('Failed to create new user');
      }
    }

    // Get user data from their specific collection
    // Use a default collection if phone number is not available
    const sanitizedPhoneNumber = user.phoneNumber ? 
      user.phoneNumber.replace(/[^0-9]/g, '') : 'default';
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