const Post = require("../../models/Post");
const checkAuth = require("../../util/check-auth");
const {AuthenticationError, UserInputError } = require("apollo-server");
const { argsToArgsConfig } = require("graphql/type/definition");

// the args for mutations are parent, args, context, info - but we add _ if not using them
module.exports = {
 
  Query: {
    async getPosts() {
      try {
        // posts - find posts and then sort. Empty Post.find() gets all posts
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
   
    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);
        if (post) {
          return post;
        } else {
          throw new Error("Post not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
   
    async createPost(_, { body }, context) {
      // check auth return the user - the function is in utils
      const user = checkAuth(context);
      
      if(body.trim() === ''){
        throw new Error('Post body must not be empty')
      }
      // create new post
      const newPost = new Post({
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
      });
      // save post
      const post = await newPost.save();
      context.pubsub.publish('NEW_POST', {
        newPost: post
      });
      return post;
    },
    
    async deletePost(_, { postId }, context) {
      const user = checkAuth(context);
      try {
        // find the the post by id
        const post = await Post.findById(postId);
        // if the username is the same as post username
        if (user.username === post.username) {
          await post.delete();
          return "Post deleted successfully";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async likePost(_, { postId }, context) {
      const { username } = checkAuth(context);

      const post = await Post.findById(postId);
      if (post) {
        if (post.likes.find((like) => like.username === username)) {
          // Post already likes, unlike it
          post.likes = post.likes.filter((like) => like.username !== username);
        } else {
          // Not liked, like post
          post.likes.push({
            username,
            createdAt: new Date().toISOString()
          });
        }

        await post.save();
        return post;
      } else throw new UserInputError('Post not found');
    }
  },
  Subscription: {
    newPost: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST')
    }
  }
};
