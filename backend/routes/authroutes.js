import express from "express";
import passport from "passport";

const router = express.Router();

// Initialize github authentication
router.get("/github", (req, res, next) => {
  if (req.query.returnToUrl) {
    req.session.returnToUrl = req.query.returnToUrl;
  }

  passport.authenticate("github", { scope: ["user:email", "repo"] })(
    req,
    res,
    next,
  );
});

// Github authentication callback
router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/api/auth/failure" }),
  (req, res) => {
    const returnToUrl = req.session.returnToUrl || "/";
    delete req.session.returnToUrl;

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:4321";
    try {
      const redirectUrl = new URL(returnToUrl, frontendUrl).toString();
      res.redirect(redirectUrl);
    } catch (e) {
      res.redirect(frontendUrl + "/");
    }
  },
);

// Get current user session
router.get("/me", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.json({
      isAuthenticated: true,
      user: {
        id: req.user.id,
        githubId: req.user.githubId,
        username: req.user.username,
        email: req.user.email,
        avatarUrl: req.user.avatarUrl,
        createdAt: req.user.createdAt,
      },
    });
  }
  return res.json({
    isAuthenticated: false,
    user: null,
  });
});

// Logout handles both GET and POST
const logoutHandler = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to logout" });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to destroy session" });
      }
      res.clearCookie("connect.sid");
      return res.json({ success: true });
    });
  });
};

router.get("/logout", logoutHandler);
router.post("/logout", logoutHandler);

// Failure landing page
router.get("/failure", (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:4321";
  res.redirect(`${frontendUrl}?auth_error=github_failed`);
});

export default router;
