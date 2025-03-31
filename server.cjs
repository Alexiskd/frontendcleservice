import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, 'dist')));

// Autres configurations et routes...

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
