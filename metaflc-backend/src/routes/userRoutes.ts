import express from 'express';
import User from '../models/User';

const router = express.Router();

/**
 * @route GET /api/v1/users/me
 * @desc Get current user info
 * @access Public (In real app, this would be Private with authentication)
 */
router.get('/me', async (req, res) => {
  try {
    // In a real app, we would get user ID from JWT token
    // For now, we'll return a mock user
    
    const mockUser = {
      id: '60d0fe4f5311236168a109ca',
      username: 'testuser',
      email: 'test@example.com',
      isVip: false,
      freeWatchTime: 60,
      freeWatchTimeResetAt: new Date(),
      freeTrialUsed: false
    };
    
    res.status(200).json({
      status: 'success',
      data: { user: mockUser }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '获取用户信息失败',
      error: (error as Error).message
    });
  }
});

/**
 * @route POST /api/v1/users/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: '请提供完整的注册信息'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: '用户名或邮箱已被使用'
      });
    }
    
    // In a real app, we would hash the password here
    const hashedPassword = password; // This is just a placeholder
    
    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });
    
    await newUser.save();
    
    res.status(201).json({
      status: 'success',
      message: '用户注册成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '注册失败',
      error: (error as Error).message
    });
  }
});

/**
 * @route POST /api/v1/users/login
 * @desc Login a user
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: '请提供邮箱和密码'
      });
    }
    
    // In a real app, we would check password against hashed password in database
    // For now, we'll return a mock token
    
    const mockToken = 'mock-jwt-token-12345';
    
    res.status(200).json({
      status: 'success',
      data: {
        token: mockToken,
        user: {
          id: '60d0fe4f5311236168a109ca',
          username: 'testuser',
          email: 'test@example.com',
          isVip: false
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '登录失败',
      error: (error as Error).message
    });
  }
});

/**
 * @route GET /api/v1/users/watch-time
 * @desc Get user watch time info
 * @access Public (In real app, this would be Private with authentication)
 */
router.get('/watch-time', async (req, res) => {
  try {
    // In a real app, we would get user ID from JWT token
    // For now, we'll return mock data
    
    const mockWatchTime = {
      freeWatchTimeRemaining: 60,
      isVip: false,
      vipExpiresAt: null,
      freeTrialUsed: false,
      freeTrialDaysRemaining: 7
    };
    
    res.status(200).json({
      status: 'success',
      data: { watchTime: mockWatchTime }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '获取观影时长信息失败',
      error: (error as Error).message
    });
  }
});

export default router;
