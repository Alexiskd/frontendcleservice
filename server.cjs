import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.static(join(__dirname, 'dist')));

// Autres routes et configurations...

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
