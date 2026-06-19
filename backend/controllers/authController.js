const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const register = async (req, res) => {
  const { email, password, firstName, lastName, role, phone, dateOfBirth, bloodType, medicalInfo, emergencyContact } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'PATIENT',
        phone,
      },
    });

    if (user.role === 'PATIENT') {
      await prisma.patientProfile.create({
        data: {
          userId: user.id,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          bloodType,
          medicalInfo,
          emergencyContact
        }
      });
    }

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user.id, email: user.email, firstName, lastName, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, phone: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getMe };
