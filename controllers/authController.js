import jwt from 'jsonwebtoken';
import User from '../models/User';

const authController = {
  register: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.create({ email, password });
      const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

      res.status(201).json({ token });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error('Invalid email or password');
      }

      const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
      res.status(200).json({ token });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};

export default authController;
