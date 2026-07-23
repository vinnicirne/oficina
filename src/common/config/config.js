module.exports = {
  server: {
    port: 3001,
    version: 'v1',
    status: 'test', // test || live
    host: 'http://localhost:3001/api/v1',
  },
  database: {
    uri: 'mongodb://localhost:27017/autorepair',
    table: '',
    validation: { runValidators: true, context: 'query' },
  },
  logger: {
    level: '',
  },
  secret: {
    passwordSalt: '$2a$10$JfDLJ/y54lEWliIif0TlaO',
    jwtSignature: '123',
  },
  listing: {
    limit: 5,
  },
  mail: {
    sendgrid: {
      apiKey: '',
      templates: {
        newUser: {
          subject: 'Verify your account',
          templateId: 'removed-for-github-push',
        },
        activeNewUser: {
          subject: 'New account details',
          templateId: 'removed-for-github-push',
        },
        forgotPassword: {
          subject: 'Password Reset',
          templateId: 'removed-for-github-push',
        },
        resetPassword: {
          subject: 'New Password',
          templateId: 'removed-for-github-push',
        },
      },
    },
    fromEmail: 'vignes.arul@gmail.com',
  },
};
