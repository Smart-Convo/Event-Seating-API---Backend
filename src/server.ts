import express, { Application } from 'express';
import cors from 'cors';
import userRoutes from './routes/users';
import { rateLimiter } from './middleware/rateLimiter';

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(rateLimiter);

app.get('/', (_req, res) => {
  res.json({ 
    message: 'Event Seating API',
    version: '1.0.0',
    endpoints: {
      users: '/users/:id',
      createUser: 'POST /users',
      cacheStatus: '/users/cache/status',
      clearCache: 'DELETE /users/cache'
    }
  });
});

app.use('/users', userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;