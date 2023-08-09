// Import the necessary modules
import jwt from 'jsonwebtoken';
import throwCustomError, {
  ErrorTypes,
} from '../handlers/error.handler.js';

// Function to get the user from the token
const getUser = async (token) => {
  try {
    if (token) {
      // Verify the token using the ACCESS_KEY from environment variables
      const user = jwt.verify(token, process.env.ACCESS_KEY);
      return user; // Return the user information if token is valid
    }
    return null; // Return null if no token is provided
  } catch (error) {
    return null; // Return null if token verification fails
  }
};

// Context function for GraphQL middleware
const context = async ({ req, res }) => {
  // Block introspection queries for security
  if (req.body.operationName === 'IntrospectionQuery') {
    return {}; // Return an empty context object
  }
  // Allow 'CreateUser' and 'Login' queries without requiring a token
  if (
    req.body.operationName === 'CreateUser' ||
    req.body.operationName === 'Login'
  ) {
    return {}; // Return an empty context object
  }

  // Get the user token from the request headers
  const token = req.headers.authorization || '';

  // Try to retrieve a user using the token
  const user = await getUser(token);

  if (!user) {
    // If no user is retrieved, throw an unauthenticated error
    throwCustomError('User is not authenticated', ErrorTypes.UNAUTHENTICATED);
  }

  // Add the authenticated user to the context for downstream resolvers
  return { user };
};

export default context; // Export the context function