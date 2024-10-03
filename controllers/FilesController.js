// controllers/FilesController.js
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

class FilesController {
  static async postUpload(req, res) {
    try {
      const token = req.headers['x-token'];
      const { name, type, parentId, isPublic = false, data } = req.body;

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }
      if (!type || !['folder', 'file', 'image'].includes(type)) {
        return res.status(400).json({ error: 'Missing type' });
      }
      if (type !== 'folder' && !data) {
        return res.status(400).json({ error: 'Missing data' });
      }

      if (parentId) {
        const parentFile = await dbClient.filesCollection.findOne({ _id: parentId });
        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }
        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      const newFile = {
        userId,
        name,
        type,
        isPublic,
        parentId: parentId || 0,
        localPath: null,
      };

      if (type === 'folder') {
        const createdFolder = await dbClient.filesCollection.insertOne(newFile);
        return res.status(201).json(createdFolder.ops[0]);
      } else {
        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
        const fileUUID = uuidv4();
        const filePath = path.join(folderPath, fileUUID);

        fs.mkdirSync(folderPath, { recursive: true });

        const buffer = Buffer.from(data, 'base64');
        fs.writeFileSync(filePath, buffer);

        newFile.localPath = filePath;

        const createdFile = await dbClient.filesCollection.insertOne(newFile);
        return res.status(201).json(createdFile.ops[0]);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default FilesController;
