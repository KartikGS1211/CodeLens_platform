import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import prisma from "../db/prisma.js";

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const callbackUrl = process.env.GITHUB_CALLBACK_URL;

if (!githubClientId || !githubClientSecret) {
  console.warn(
    "⚠️ GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET not set in environment. GitHub OAuth will not function properly.",
  );
}

passport.use(
  new GitHubStrategy(
    {
      clientID: githubClientId || "placeholder",
      clientSecret: githubClientSecret || "placeholder",
      callbackURL: callbackUrl,
      scope: ["user:email", "repo"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const githubId = profile.id;
        const username = profile.username;
        const email = profile.emails && profile.emails[0]?.value;
        const avatarUrl = profile.photos && profile.photos[0]?.value;

        // Upsert the user with the new token
        const user = await prisma.user.upsert({
          where: { githubId },
          update: {
            username,
            email,
            avatarUrl,
            githubAccessToken: accessToken,
          },
          create: {
            githubId,
            username,
            email,
            avatarUrl,
            githubAccessToken: accessToken,
          },
        });

        return done(null, user);
      } catch (err) {
        console.error("Error in GitHubStrategy verification:", err);
        return done(err);
      }
    },
  ),
);

export default passport;
