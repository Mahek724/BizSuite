import dotenv from "dotenv";
dotenv.config();
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // first check by email
        let email = profile.emails?.[0]?.value;
        let user = await User.findOne({ email });

        if (user) {
          // if user exists but no googleId, link it
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
        } else {
          // if not found, create new
          user = await User.create({
            fullName: profile.displayName,
            email,
            googleId: profile.id,
            role: "Staff",
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
export default passport;
