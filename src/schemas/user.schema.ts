const userSchema = `#graphql
  scalar DateTime

  type User {
    id: String
    email: String
    username: String
    password: String
    createdAt: DateTime
    updatedAt: DateTime
  }

  input SignupInput {
    email: String!
    password: String!
    username: String
  }

  input LoginInput {
    email: String!
    password: String!
    twofa_token: String
  }

  input changePassInput{
    oldPassword: String!,
    newPassword: String!
  }

  type Query {
    users: [User]
    user(id: ID!): User!
  }

  type JwtToken {
    token: String!
  }

  type UserWithToken {
    id: String
    email: String
    username: String
    createdAt: DateTime
    updatedAt: DateTime
    userJwtToken: JwtToken
  }

  type UserWithQR {
    id: String
    email: String
    username: String
    createdAt: DateTime
    updatedAt: DateTime
    qrCode: String
    secret: String
    userJwtToken: JwtToken
  }

  type UserWithoutToken {
    id: String
    email: String
    username: String
    createdAt: DateTime
    updatedAt: DateTime
  }

  type Mutation {
    login(input: LoginInput!): UserWithToken
    signup(input: SignupInput!): UserWithQR
    changePassword(input: changePassInput!): UserWithoutToken
  }
`;

export default userSchema;