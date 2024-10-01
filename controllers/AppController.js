// controllers/AppController.js
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(req, res) {
    const redisAlive = redisClient.isAlive();
    const dbAlive = dbClient.isAlive();

    res.status(200).json({ redis: redisAlive, db: dbAlive });
  }

  static async getStats(req, res) {
    try {
      const usersCount = await dbClient.nbUsers();  // Get number of users
      const filesCount = await dbClient.nbFiles();  // Get number of files

      res.status(200).json({ users: usersCount, files: filesCount });
    } catch (error) {
      res.status(500).json({ error: 'Error retrieving statistics' });
    }
  }
}

export default AppController;
