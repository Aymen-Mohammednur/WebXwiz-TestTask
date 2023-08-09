// Import necessary modules and dependencies
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import dotenv from "dotenv";
import mongoose from 'mongoose';
dotenv.config();

import context from './context/context.js'
import userSchema from './schemas/index.schema.js'
import userResolver from './resolvers/user.resolver.js';

// Create an ApolloServer instance with defined typeDefs and resolvers
const server = new ApolloServer({
    typeDefs: userSchema,
    resolvers: userResolver,
    introspection: process.env.NODE_ENV !== 'prod'
})

// Define database connection URL and port from environment variables
const DB_NAME = process.env.DB_NAME;
const DB_URL = `${process.env.DB_URL}/${DB_NAME}?retryWrites=true&w=majority`;
const PORT = Number(process.env.PORT)

// Set mongoose to enforce strict query mode
mongoose.set('strictQuery', true);
// Connect to the database and start the Apollo Server
mongoose
    .connect(DB_URL)
    .then(() => {
        console.log('Connected to database');
        return startStandaloneServer(server, {
            listen: { port: PORT },
            context: context
        });
    })
    .then((server) => {
        console.log(`Server running at: ${server.url}`);
    });