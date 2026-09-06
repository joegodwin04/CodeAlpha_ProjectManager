const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, username, email, password, securityQuestion, securityAnswer } = req.body;

    // Validate required fields including security question and answer
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'All personal and account fields are required' });
    }

    if (!securityQuestion || !securityAnswer || !securityAnswer.trim()) {
      return res.status(400).json({ message: 'A security question and answer are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();

    // Check if user exists
    const userExists = await User.findOne({ where: { email: cleanEmail } });
    if (userExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const usernameExists = await User.findOne({ where: { username: cleanUsername } });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash normalized security answer (trimmed and lowercased for case-insensitivity)
    const normalizedAnswer = securityAnswer.trim().toLowerCase();
    const salt = await bcrypt.genSalt(10);
    const securityAnswerHash = await bcrypt.hash(normalizedAnswer, salt);

    // Create user with hashed security answer
    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password,
      securityQuestion: securityQuestion.trim(),
      securityAnswerHash,
    });

    if (user) {
      res.status(201).json({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        securityQuestion: user.securityQuestion,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: cleanEmail } });

    if (user && (await user.comparePassword(password))) {
      res.json({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        securityQuestion: user.securityQuestion || null,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'securityAnswerHash'] }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot Password — Step 1: Look up account and return the security question
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: cleanEmail } });

    if (!user || !user.securityQuestion) {
      // Safe generic message to protect privacy and prevent unnecessary account enumeration
      return res.status(404).json({
        message: 'No security question is configured for this account. Please verify the email address.'
      });
    }

    res.json({
      email: user.email,
      securityQuestion: user.securityQuestion
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot Password — Step 2: Verify security answer and return short-lived reset token
const verifySecurityAnswer = async (req, res) => {
  try {
    const { email, securityAnswer } = req.body;

    if (!email || !securityAnswer || !securityAnswer.trim()) {
      return res.status(400).json({ message: 'Email and security answer are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: cleanEmail } });

    if (!user || !user.securityAnswerHash) {
      return res.status(400).json({ message: 'Verification failed. Security question not configured for this account.' });
    }

    const normalizedAnswer = securityAnswer.trim().toLowerCase();
    const isMatch = await bcrypt.compare(normalizedAnswer, user.securityAnswerHash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect security answer. Please try again.' });
    }

    // Issue short-lived dedicated reset token (15-minute expiration)
    const resetToken = jwt.sign(
      { id: user.id, purpose: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      message: 'Security answer verified successfully',
      resetToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot Password — Step 3: Validate reset token and update password
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Password reset link or token has expired or is invalid' });
    }

    if (!decoded || decoded.purpose !== 'password_reset') {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password — triggers Sequelize beforeUpdate hook to hash password with bcrypt
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully. You can now sign in with your new password.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  verifySecurityAnswer,
  resetPassword
};
