const {
  getUserProfile,
  updateUserProfile,
} = require("../models/userModel");

async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    const user = await getUserProfile(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.json({
      user,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return res.status(500).json({
      error: "Failed to load profile",
    });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.id;

    const {
      displayName,
      bio,
      avatarUrl,
    } = req.body;

    if (
      displayName !== undefined &&
      typeof displayName !== "string"
    ) {
      return res.status(400).json({
        error: "Display name must be a string",
      });
    }

    if (
      bio !== undefined &&
      typeof bio !== "string"
    ) {
      return res.status(400).json({
        error: "Bio must be a string",
      });
    }

    if (
      avatarUrl !== undefined &&
      avatarUrl !== null &&
      typeof avatarUrl !== "string"
    ) {
      return res.status(400).json({
        error: "Avatar URL must be a string",
      });
    }

    const currentUser = await getUserProfile(userId);

    if (!currentUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const updatedUser = await updateUserProfile(userId, {
      displayName:
        displayName !== undefined
          ? displayName.trim()
          : currentUser.display_name,

      bio:
        bio !== undefined
          ? bio.trim()
          : currentUser.bio,

      avatarUrl:
        avatarUrl !== undefined
          ? avatarUrl
          : currentUser.avatar_url,
    });

    return res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      error: "Failed to update profile",
    });
  }
}

module.exports = {
  getProfile,
  updateProfile,
};