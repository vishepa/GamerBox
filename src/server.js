import express from 'express';
import { env } from './config/env.js';
import catalogueRoutes from './routes/catalogue.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('GamerBox API is running');
});

app.use('/api', catalogueRoutes);

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});
