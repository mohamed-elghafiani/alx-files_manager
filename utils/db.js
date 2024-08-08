import mongoose from 'mongoose';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    const mongoURI = `mongodb://${host}:${port}/${database}`;
    mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    this.connection = mongoose.connection;

    this.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    this.connection.once('open', () => {
      console.log('MongoDB connected successfully');
    });
  }

  isAlive() {
    return this.connection.readyState === 1;
  }
}

const dbClient = new DBClient();
export default dbClient;
