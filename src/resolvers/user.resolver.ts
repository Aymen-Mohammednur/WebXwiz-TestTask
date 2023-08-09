// Import necessary modules and dependencies
import UserModel from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import throwCustomError, {
    ErrorTypes,
} from '../handlers/error.handler.js';
import { GraphQLError } from 'graphql';
import bcrypt from "bcryptjs";
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// Define userResolver object
const userResolver = {
    Query: {
        users: async () => {
            try {
                // Retrieve a list of users, sorted by creation time
                const users = await UserModel.find()
                    .sort({ createdAt: -1 })
                return users;
            } catch (error) {
                throw new GraphQLError(error.message);
            }
        },

        user: async (_, { id }, contextValue) => {
            try {
                // Find a user by their ID
                const user = await UserModel.findById(id);
                return user;
            } catch (error) {
                throw new GraphQLError(error.message);
            }
        },
    },

    Mutation: {
        signup: async (_, { input }) => {
            const { email, password, username } = input;

            // Check if user with the same email already exists
            const userExists = await UserModel.findOne({ email: email });
            if (userExists) {
                throwCustomError(
                    'User with that email already exists',
                    ErrorTypes.ALREADY_EXISTS
                );
            }

            // Generate a new secret key for two-factor authentication
            const secret = speakeasy.generateSecret({ length: 20 });

            // Hash the user's password for security
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create a new user instance
            const user = new UserModel({
                email: email,
                password: hashedPassword,
                username: username,
                secret: secret.base32
            });
            // Save the user to the database
            const savedUser = await user.save();
            // Generate a JWT token for authentication
            const token = jwt.sign(
                { userId: user._id, email: user.email },
                process.env.ACCESS_KEY,
                { expiresIn: process.env.TOKEN_EXPIRY_TIME }
            );

            // Generate a QR code for two-factor authentication setup
            const qrCode = await QRCode.toDataURL(secret.otpauth_url)

            // Return relevant user information and tokens
            return {
                id: savedUser._id,
                email: savedUser.email,
                username: savedUser.username,
                createdAt: savedUser.createdAt,
                updatedAt: savedUser.updatedAt,
                secret: secret.base32,
                qrCode: qrCode,
                userJwtToken: {
                    token: token,
                },
            };
        },

        login: async (_, { input: { email, password, twofa_token } }, context) => {
            // Checking if the email is correct
            const user = await UserModel.findOne({ email: email });
            if (!user) {
                throwCustomError(
                    'Email or password is wrong',
                    ErrorTypes.BAD_USER_INPUT
                );
            }
            // Checking if password is correct
            const validPass = await bcrypt.compare(password, user.password);
            if (!validPass) {
                throwCustomError(
                    'Email or password is wrong',
                    ErrorTypes.BAD_USER_INPUT
                );
            }

            // Verify the users 2fa secret
            const verified = speakeasy.totp.verify({
                secret: user.secret,
                encoding: 'base32',
                token: twofa_token,
            });

            if (!verified) {
                throwCustomError(
                    'Invalid 2FA token',
                    ErrorTypes.BAD_USER_INPUT
                );
            }

            // if user is valid assign jwt token
            const token = jwt.sign({ _id: user._id, email: user.email }, process.env.ACCESS_KEY, {
                expiresIn: process.env.TOKEN_EXPIRY_TIME,
                algorithm: "HS256",
            });


            return {
                id: user._id,
                email: user.email,
                username: user.username,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                userJwtToken: {
                    token: token,
                },
            };
        },

        changePassword: async (_, { input: { oldPassword, newPassword } }, context) => {
            // Generate a salt and hash the new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Find the user by their ID
            const changedPasswordUser = await UserModel.findById(context.user._id);
            // Check if the provided old password is valid
            const oldPassValid = await bcrypt.compare(oldPassword, changedPasswordUser.password);
            if (!oldPassValid) {
                throwCustomError(
                    'Current password is not correct',
                    ErrorTypes.BAD_USER_INPUT
                );
            }
            // Check if the new password is the same as the old password
            const newPassValid = await bcrypt.compare(newPassword, changedPasswordUser.password);
            if (newPassValid) {
                throwCustomError(
                    'Same password detected, enter a different one',
                    ErrorTypes.BAD_USER_INPUT
                );
            }
            // Update the user's password with the new hashed password
            changedPasswordUser.password = hashedPassword;
            await changedPasswordUser.save();
            // Return updated user information
            return {
                id: changedPasswordUser._id,
                email: changedPasswordUser.email,
                username: changedPasswordUser.username,
                createdAt: changedPasswordUser.createdAt,
                updatedAt: changedPasswordUser.updatedAt,
            };
        },
    },
};

export default userResolver;