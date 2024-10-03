// controllers/AuthController.js
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';
import { createHash } from 'crypto';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const [email, password] = Buffer.from(token, 'base64').toString('utf-8').split(':');

    const hashedPassword = createHash('sha1').update(password).digest('hex');

    const user = await dbClient.usersCollection.findOne({ email, password: hashedPassword });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tokenString = uuidv4();
    const key = `auth_${tokenString}`;

    await redisClient.set(key, 24 * 60 * 60, user._id.toString());

    return res.status(200).json({ token: tokenString });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;

    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(key);
    return res.status(204).send();
  }
}

export default AuthController;
