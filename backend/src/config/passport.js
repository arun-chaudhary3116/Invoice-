import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../model/user.model.js";

const initPassport = () => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Missing Google OAuth env variables");
  }

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).exec();
      done(null, user || null);
    } catch (err) {
      done(err);
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value;

          if (!email) {
            return done(new Error("No email returned from Google"));
          }

          let user = await User.findOne({ googleId });

          if (user) {
            user.lastLoginAt = new Date();
            await user.save();
            return done(null, user);
          }

          user = await User.create({
            googleId,
            email,
            name: profile.displayName,
            givenName: profile.name?.givenName,
            familyName: profile.name?.familyName,
            avatar: profile.photos?.[0]?.value,
            providerData: profile,
            lastLoginAt: new Date(),
          });

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );
};

export default initPassport;
