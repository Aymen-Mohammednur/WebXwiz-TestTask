// Import necessary modules
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { GraphQLError } from 'graphql';

// Define different error types along with their codes and HTTP status
export const ErrorTypes = {
    BAD_USER_INPUT: {
        errorCode: ApolloServerErrorCode.BAD_USER_INPUT,
        errorStatus: 400,
    },
    BAD_REQUEST: {
        errorCode: ApolloServerErrorCode.BAD_REQUEST,
        errorStatus: 400,
    },
    NOT_FOUND: {
        errorCode: 'NOT_FOUND',
        errorStatus: 404,
    },
    UNAUTHENTICATED: {
        errorCode: 'UNAUTHENTICATED',
        errorStatus: 401,
    },
    ALREADY_EXISTS: {
        errorCode: 'ALREADY_EXISTS',
        errorStatus: 400,
    },
    INTERNAL_SERVER_ERROR: {
        errorCode: ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
        errorStatus: 500,
    },
};

// Function to throw a custom GraphQL error
export default (errorMessage, errorType) => {
    // Create a new GraphQLError with the provided message and extensions
    throw new GraphQLError(errorMessage, {
        extensions: {
            code: errorType.errorCode,
            http: {
                status: errorType.errorStatus,
            },
        },
    });
};