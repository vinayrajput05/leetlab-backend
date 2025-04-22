import bcrypt from 'bcryptjs'; // For hashing and comparing passwords
import jwt from 'jsonwebtoken'; // For creating JSON Web Tokens
import { db } from '../libs/db.js'; // Prisma database client
import { UserRole } from '../generated/prisma/index.js'; // Enum for user roles
import ApiError from '../utils/api-error.js';
import ApiResponse from '../utils/api-response.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body; // Extract user details from request body

  try {
    // Check if a user with the given email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ApiError(400, 'User already exists');
    }

    // Hash the user's password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: UserRole.USER, // Default role as USER
      },
    });

    // Generate a JWT access token
    const token = jwt.sign(
      { id: newUser.id }, // Payload
      process.env.JWT_ACCESS_TOKEN_SECRET, // Secret key
      { expiresIn: '7d' }, // Token expiry
    );

    // Set the JWT token in an HTTP-only cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    // Respond with the new user’s data (excluding the password)
    res.status(200).json(
      new ApiResponse(
        200,
        {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          image: newUser.image, // Optional if image exists
        },
        'User created successfully',
      ),
    );
  } catch (error) {
    console.log('controller register', error);
    throw new ApiError(500, 'Something went wrong');
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ApiError(400, 'User not found');
    }

    // Compare the provided password with the hashed one in DB
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new ApiError(400, 'Invalid credentials');
    }

    // Create a new JWT token for the logged-in user
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_ACCESS_TOKEN_SECRET,
      { expiresIn: '7d' },
    );

    // Set the token in a secure cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    // Send a success response with user data (excluding password)
    res.status(200).json(
      new ApiResponse(
        200,
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        },
        'User logged in successfully',
      ),
    );
  } catch (error) {
    console.log('controller login', error);
    throw new ApiError(500, 'Something went wrong');
  }
};

export const logout = async (req, res) => {
  try {
    // Clear the JWT cookie to log the user out
    res.cookie('jwt', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 0, // Clear cookie immediately
    });
    res
      .status(200)
      .json(new ApiResponse(200, '', 'User logged out successfully'));
  } catch (error) {
    console.log('controller logout', error);
    throw new ApiError(500, 'Something went wrong');
  }
};

export const check = async (req, res) => {
  try {
    // If middleware has set req.user, the user is authenticated
    res
      .status(200)
      .json(new ApiResponse(200, req.user, 'User is authenticated'));
  } catch (error) {
    console.log('controller check', error);
    throw new ApiError(500, 'Something went wrong');
  }
};
