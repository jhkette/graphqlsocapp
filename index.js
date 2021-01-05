const { URI } = require("./config/config");
const { ApolloServer, PubSub } = require("apollo-server");

const mongoose = require("mongoose");
const resolvers = require("./graphql/resolvers/index");
const typeDefs = require("./graphql/typeDef");


const pubsub = new PubSub();
// create new Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // we need to add context here - this will allow us to get
  // authoissation data - ie the the jwt token in the header - to use to get the user for createPost mutation etc
  // the req is the request object
  // https://www.apollographql.com/docs/apollo-server/data/resolvers/#the-context-argument
  // we are also adding subscription here
  context: ({ req }) => ({ req, pubsub })
});

// connect to mongoose
mongoose
  .connect(URI, { useNewUrlParser: true })
  .then(() => {
    console.log("MongoDB Connected");
    return server.listen({ port: 5000 });
  })
  // then ad
  .then((res) => {
    console.log(`Server running at ${res.url}`);
  });
