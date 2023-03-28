const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

// create resolvers
const resolvers = {

  Query: {
      me: async (parent, args, context) => {
          if (context.user) {
              const test= await User.findOne({ _id: context.user._id });
              return test;
          } 
          throw new AuthenticationError('Please login!');
      },
  },

  Mutation: {
    // login
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError('Incorrect email.');
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError('Incorrect password');
      }
      const token = signToken(user);
      return { token, user };
    },
    // add new user
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    // save a book
    saveBook: async (parent, {authors, bookId, description, image, link, title}, context) => {
      if (context.user) {
        description = description || '';
        return await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: {authors, bookId, description, image, link, title} } },
          { new: true }
        );
      }
      throw new AuthenticationError('Please login!');
    },
    // delete a book
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        return await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: {bookId }} },
          { new: true }
        );
      }
      throw new AuthenticationError('Please login!');
    },
  }

};

module.exports = resolvers;