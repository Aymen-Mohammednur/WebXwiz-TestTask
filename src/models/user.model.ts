// Import necessary modules from mongoose
import { Schema, model } from 'mongoose';

// Define the user schema using the Schema constructor
const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        secret: {
            type: String
        }
    },
    {
        // Enable automatic timestamps for created and updated fields
        timestamps: true,
    }
);

// Create a model named 'User' using the user schema
const UserModel = model('User', userSchema);
export default UserModel;