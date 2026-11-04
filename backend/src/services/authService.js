const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config/env');

const generateToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: '8h' });

const register = async (userData) => {
  const { name, email, password, role } = userData;
  const existing = await User.findOne({ where: { email } });
  if (existing) throw { status: 409, message: 'Email already in use.' };
  const password_hash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password_hash, role: role || 'VIEWER' });
  const token = generateToken(user);
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email, is_active: true } });
  if (!user) throw { status: 401, message: 'Invalid credentials.' };
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw { status: 401, message: 'Invalid credentials.' };
  const token = generateToken(user);
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
};

const getMe = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'name', 'email', 'role', 'is_active', 'created_at'],
  });
  if (!user) throw { status: 404, message: 'User not found.' };
  return user;
};

module.exports = { register, login, getMe };
