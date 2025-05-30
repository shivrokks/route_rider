import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../model/user';
import { APIError } from '../types/errors';

export const checkDriverStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.query;
    
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email: email.toString() });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ isDriver: user.isDriver });
  } catch (error) {
    console.error('Error checking driver status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a dynamic schema for user-specific data
const createUserDataSchema = () => {
  return new mongoose.Schema({
    userId: String,
    userData: {
      fullName: String,
      email: String,
      phoneNumber: String,
      isDriver: { type: Boolean, default: false } // Added isDriver field
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
    const { fullName, email, phoneNumber, settings, isDriver } = req.body;
    console.log('Updating profile:', { fullName, email, phoneNumber, settings, isDriver });

    if (!email || !phoneNumber) {
      throw new APIError('Email and phone number are required');
    }

    let user;
    // First try to find the user by email
    user = await User.findOne({ email });
    
    if (user) {
      // If user exists, update their details
      user.fullName = fullName;
      user.phoneNumber = phoneNumber;
      // Update isDriver field in the main User model if it exists
      if (isDriver !== undefined) {
        user.isDriver = isDriver;
      }
      await user.save();
    } else {
      // If user doesn't exist, create a new one
      user = await User.create({
        email,
        fullName,
        phoneNumber,
        isDriver: isDriver !== undefined ? isDriver : false // Default to false for new users
      });
    }

    // Create or update user-specific data in a separate collection
    const sanitizedPhoneNumber = phoneNumber.replace(/[^0-9]/g, '');
    const collectionName = `userData_${sanitizedPhoneNumber}`;

    try {
      // Create or get the model for this collection
      const UserDataModel = mongoose.models[collectionName] || 
        mongoose.model(collectionName, createUserDataSchema());

      // Create or update user specific data
      const userData = await UserDataModel.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          userData: {
            fullName,
            email,
            phoneNumber,
            isDriver: isDriver !== undefined ? isDriver : false
          },
          settings: settings || {
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

      console.log('User data updated:', userData);

      res.status(200).json({
        success: true,
        data: {
          ...userData.userData,
          settings: userData.settings
        },
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Error updating user data:', error);
      // Handle MongoDB validation errors
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map(err => err.message)
        });
        return;
      }
      // Handle duplicate key errors
      if ((error as any).code === 11000) {
        res.status(400).json({
          success: false,
          message: 'This email or phone number is already associated with another account'
        });
        return;
      }
      // Handle other errors
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update user data'
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
    let isNewUser = false;
    
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
          phoneNumber: '', // Empty phone number by default
          isDriver: false // Default to false for new users
        });
        isNewUser = true;
        console.log('New user created:', user);

        // Create default user data collection for new users
        const defaultCollectionName = `userData_default`;
        try {
          const UserDataModel = mongoose.models[defaultCollectionName] || 
            mongoose.model(defaultCollectionName, createUserDataSchema());

          await UserDataModel.create({
            userId: user._id,
            userData: {
              fullName: user.fullName,
              email: user.email,
              phoneNumber: user.phoneNumber,
              isDriver: false
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
          });
          console.log('Created default user data collection');
        } catch (collectionError) {
          console.error('Error creating default user data collection:', collectionError);
          // Continue even if this fails, we'll fallback to main collection data
        }
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
      
      let userData = await UserDataModel.findOne({ userId: user._id });

      // If this is a new user or no user data exists, create it
      if (!userData) {
        userData = await UserDataModel.create({
          userId: user._id,
          userData: {
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            isDriver: user.isDriver || false
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
        });
      }

      // Check if user is a driver and include that information in response
      const isDriver = userData.userData.isDriver || user.isDriver || false;

      res.status(200).json({
        success: true,
        data: {
          ...userData.userData,
          settings: userData.settings,
          isDriver: isDriver
        },
        message: isNewUser ? 'New profile created' : 'Profile retrieved successfully',
        redirectTo: isDriver ? '/driver' : '/user' // Add redirect information
      });
    } catch (error) {
      console.error('Error with user data collection:', error);
      // Fallback to user collection data if specific collection fails
      const isDriver = user.isDriver || false;
      res.status(200).json({
        success: true,
        data: {
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          email: user.email,
          isDriver: isDriver
        },
        message: 'Profile retrieved from main collection',
        redirectTo: isDriver ? '/driver' : '/user'
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

// New endpoint to update driver status (for admin use)
export const updateDriverStatus = async (req: Request, res: Response) => {
  try {
    const { email, isDriver } = req.body;

    if (!email || isDriver === undefined) {
      throw new APIError('Email and driver status are required');
    }

    // Find and update user in main collection
    const user = await User.findOneAndUpdate(
      { email },
      { isDriver },
      { new: true }
    );

    if (!user) {
      throw new APIError('User not found');
    }

    // Also update in user-specific collection if it exists
    const sanitizedPhoneNumber = user.phoneNumber ? 
      user.phoneNumber.replace(/[^0-9]/g, '') : 'default';
    const collectionName = `userData_${sanitizedPhoneNumber}`;

    try {
      const UserDataModel = mongoose.models[collectionName] || 
        mongoose.model(collectionName, createUserDataSchema());

      await UserDataModel.findOneAndUpdate(
        { userId: user._id },
        { 'userData.isDriver': isDriver },
        { new: true }
      );
    } catch (error) {
      console.log('Could not update user-specific collection, but main user updated');
    }

    res.status(200).json({
      success: true,
      data: {
        email: user.email,
        fullName: user.fullName,
        isDriver: user.isDriver
      },
      message: `User driver status updated to ${isDriver}`
    });

  } catch (error) {
    if (error instanceof APIError) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Error updating driver status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};