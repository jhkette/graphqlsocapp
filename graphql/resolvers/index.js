const postsResolvers = require('./posts');
const usersResolvers = require('./users');
const commentsResolvers = require('./comments');
module.exports = {
  Post: {
    // we use post here to return a calculation 
    // for likeCount and commentCount
    likeCount: (parent) => parent.likes.length,
    commentCount: (parent) => parent.comments.length
  },
  // slide in postResolvers
  Query: {
    ...postsResolvers.Query
    
  }
  ,
  Mutation: {
    // slide in usersResolvers
    ...usersResolvers.Mutation,
    ...postsResolvers.Mutation,
    ...commentsResolvers.Mutation
  },
  Subscription: {
    ...postsResolvers.Subscription
  }
};