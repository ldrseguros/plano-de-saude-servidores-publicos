import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/database.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import config from "../config/env.js";

// Register new admin user
export const registerAdmin = async (req, res) => {
  try {
    const { username, email, password, name, role = "admin" } = req.body;

    // Validate required fields
    if (!username || !email || !password || !name) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            false,
            400,
            {},
            "Username, email, password, and name are required"
          )
        );
    }

    // Check if admin already exists
    const existingAdmin = await prisma.adminUser.findFirst({
      where: {
        OR: [{ email: email }, { username: username }],
      },
    });

    if (existingAdmin) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            false,
            400,
            {},
            "Admin with this email or username already exists"
          )
        );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new admin user
    const newAdmin = await prisma.adminUser.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
        role,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res
      .status(201)
      .json(
        new ApiResponse(true, 201, newAdmin, "Admin user created successfully")
      );
  } catch (error) {
    console.error("Error creating admin user:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};

// Login admin user
export const loginAdmin = async (req, res) => {
  try {
    console.log("🔍 Login attempt - Request body:", req.body);
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      console.log("❌ Login failed - Missing username or password");
      return res
        .status(400)
        .json(
          new ApiResponse(false, 400, {}, "Username and password are required")
        );
    }

    // Find admin user (can login with username or email)
    const admin = await prisma.adminUser.findFirst({
      where: {
        OR: [{ username: username }, { email: username }],
        isActive: true,
      },
    });

    console.log(
      "🔍 User lookup result:",
      admin ? `Found: ${admin.username} (${admin.id})` : "User not found"
    );

    if (!admin) {
      console.log("❌ Login failed - User not found");
      return res
        .status(401)
        .json(
          new ApiResponse(false, 401, null, "Invalid username or password")
        );
    }

    // Verify password
    console.log(`🔍 Attempting password verification for ${admin.username}`);
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    console.log(
      `🔍 Password verification result: ${
        isPasswordValid ? "Valid" : "Invalid"
      }`
    );

    if (!isPasswordValid) {
      console.log(`❌ Login failed - Invalid password for ${admin.username}`);
      return res
        .status(401)
        .json(
          new ApiResponse(false, 401, null, "Invalid username or password")
        );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        adminId: admin.id,
        username: admin.username,
        role: admin.role,
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    // Update last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    // Return user data and token
    const adminData = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      lastLogin: new Date(),
    };

    console.log(`✅ Login successful for ${admin.username}`);
    return res
      .status(200)
      .json(
        new ApiResponse(
          true,
          200,
          { admin: adminData, token },
          "Login successful"
        )
      );
  } catch (error) {
    console.error("Error during admin login:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};

// Get current admin profile
export const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.admin.adminId;

    const admin = await prisma.adminUser.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return res
        .status(404)
        .json(new ApiResponse(false, 404, null, "Admin not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          true,
          200,
          admin,
          "Admin profile retrieved successfully"
        )
      );
  } catch (error) {
    console.error("Error getting admin profile:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};

// Middleware to verify JWT token
export const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json(new ApiResponse(false, 401, null, "Access token required"));
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Verify admin still exists and is active
    const admin = await prisma.adminUser.findUnique({
      where: { id: decoded.adminId, isActive: true },
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
      },
    });

    if (!admin) {
      return res
        .status(401)
        .json(new ApiResponse(false, 401, null, "Invalid or expired token"));
    }

    req.admin = decoded;
    next();
  } catch (error) {
    console.error("Error verifying admin token:", error);
    return res
      .status(401)
      .json(new ApiResponse(false, 401, null, "Invalid or expired token"));
  }
};
