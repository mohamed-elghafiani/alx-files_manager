import dbClient from '../utils/db.js';
import crypto from 'crypto';

class UsersController {
  static async postNew(req, res) {
    try {
      const { email, password } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }

      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }

      // Check if MongoDB is connected
      if (!dbClient.isAlive()) {
        return res.status(500).json({ error: 'MongoDB connection error' });
      }

      // Check if the email already exists in the database
      const existingUser = await dbClient.usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hash the password
      const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

      // Insert the new user into the database
      const newUser = await dbClient.usersCollection.insertOne({
        email,
        password: hashedPassword,
      });

      // Return the new user's id and email
      return res.status(201).json({
        id: newUser.insertedId,
        email,
      });
    } catch (err) {
      console.error('Error creating user:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UsersController;
