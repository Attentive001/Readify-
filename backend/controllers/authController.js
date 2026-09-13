const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const {
  createUser,
  findUserByEmail,
  findUserById,
} = require("../models/userModel");

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).max(80).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
}

async function register(req, res, next) {
  try {
    const { email, password, displayName } =
      registerSchema.parse(req.body);

    const existing = await findUserByEmail(email);

    if (existing) {
      return res.status(409).json({
        error: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await createUser({
      email,
      passwordHash,
      displayName,
    });

    const token = signToken(user);

    res.status(201).json({
      user,
      token,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } =
      loginSchema.parse(req.body);

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const valid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!valid) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const token = signToken(user);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
}

async function profile(req, res, next) {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    res.json({
      user,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  profile,
};