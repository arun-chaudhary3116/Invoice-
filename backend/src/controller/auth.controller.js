import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../model/user.model.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ==========================
// TOKEN HELPER
// ==========================
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ==========================
// GOOGLE LOGIN
// ==========================
export const verifyGoogleToken = async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const p = ticket.getPayload();

    // Find by googleId first, then fall back to email
    let user = await User.findOne({ googleId: p.sub });
    if (!user) {
      user = await User.findOne({ email: p.email });
    }

    if (!user) {
      user = await User.create({
        googleId: p.sub,
        email: p.email,
        name: p.name,
        givenName: p.given_name,
        familyName: p.family_name,
        avatar: p.picture,
        avatarSource: "google",
        provider: "google",
        providerData: p,
        lastLoginAt: new Date(),
      });
    } else {
      // Always link the googleId if missing
      if (!user.googleId) user.googleId = p.sub;

      user.lastLoginAt = new Date();

      // ONLY update avatar from Google if user hasn't uploaded a custom one
      if (user.avatarSource !== "upload") {
        user.avatar = p.picture;
        user.avatarSource = "google";
      }
      // avatarSource === "upload" → leave avatar completely untouched

      await user.save();
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: user.publicProfile?.() || {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        avatarSource: user.avatarSource,
        provider: user.provider,
        roles: user.roles,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid Google token" });
  }
};

// ==========================
// SIGNUP (EMAIL)
// ==========================
export const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: normalizedEmail,
      name,
      passwordHash,

      // ✅ FIXED (was "local")
      provider: "email",

      avatarSource: "upload",
      roles: ["user"],
      isActive: true,
    });

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
        avatarSource: user.avatarSource,
        provider: user.provider,
        roles: user.roles,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed" });
  }
};

// ==========================
// SIGNIN (EMAIL)
// ==========================
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);

    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
        avatarSource: user.avatarSource,
        provider: user.provider,
        roles: user.roles,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signin failed" });
  }
};

// ==========================
// UPDATE PROFILE
// ==========================
// ==========================
// UPDATE PROFILE
// ==========================
export const updateMe = async (req, res) => {
  try {
    const userId = req.user._id;

    const updateData = {};

    if (req.body.name) updateData.name = req.body.name;
    if (req.body.nickname) updateData.nickname = req.body.nickname;

    if (req.file) {
      // multer-storage-cloudinary puts the URL in req.file.path
      const imageUrl = req.file.path || req.file.secure_url || req.file.url;
      if (imageUrl) {
        updateData.avatar = imageUrl;
        updateData.avatarSource = "upload"; // ← this is what prevents Google from overwriting
      }
    }

    console.log("[updateMe] Saving to DB:", updateData);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(
      "[updateMe] DB result - avatar:",
      updatedUser.avatar,
      "avatarSource:",
      updatedUser.avatarSource,
    );

    const responseUser = updatedUser.publicProfile
      ? updatedUser.publicProfile()
      : {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          avatar: updatedUser.avatar || "",
          avatarSource: updatedUser.avatarSource,
          provider: updatedUser.provider,
          roles: updatedUser.roles,
        };

    res.json({ user: responseUser });
  } catch (err) {
    console.error("updateMe error:", err);
    res.status(500).json({ message: "Profile update failed" });
  }
};

// ==========================
// GET ME
// ==========================
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("📊 GET /me endpoint - User data from DB:");
    console.log("   - avatar:", user.avatar);
    console.log("   - avatarSource:", user.avatarSource);

    res.json({
      user: user.publicProfile
        ? user.publicProfile()
        : {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar || "",
            avatarSource: user.avatarSource,
            provider: user.provider,
            roles: user.roles,
          },
    });
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

// ==========================
// LOGOUT
// ==========================
export const logout = (req, res) => {
  res.json({ message: "Logged out" });
};
