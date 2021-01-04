const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");
const User = require("../../models/User");
const { SECRET_KEY } = require("../../config/config");
const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../util/validator");

// helper function that creates a jwt token
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    SECRET_KEY, //using secret_key
    { expiresIn: "1h" }
  );
}
// the args for mutations are parent, args, context, info - but we add _ if not using them
module.exports = {
  Mutation: {
    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      const user = await User.findOne({ username });
      if (!user) {
        errors.general = "User not found";
        throw new UserInputError("User not found", { errors });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = "Wrong crendetials";
        throw new UserInputError("Wrong crendetials", { errors });
      }
      const token = generateToken(user);
      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
    // destucturing the registerInput
    // and context and info
    async register(
      _,
      { registerInput: { username, email, password, confirmPassword } },
      context,
      info
    ) {
      // validate user using utils
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      // if not valid
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      // VALIDATE USER DATA
      const user = await User.findOne({ username }); //  find User
      // if user
      if (user) {
        // throw new user error
        throw new UserInputError("Username is taken", {
          errors: {
            username: "This username is taken",
          },
        });
      }
      // get password using bcrypt
      password = await bcrypt.hash(password, 12);
      //  add newUser using User model
      const newUser = new User({
        username,
        email,
        password,
        createdAt: new Date().toISOString(),
      });
      //   save the user using mongoose method
      const res = await newUser.save();
      //  get a token using jwt
      const token = generateToken(res);
      // spread in res._doc (ie the user)
      // the id: res._id and the token
      return {
        ...res._doc,  // res._doc is whole document
        id: res._id, // we also need to add the id - doesn't come with doc
        token, // also need token
      };
    },
  },
};
