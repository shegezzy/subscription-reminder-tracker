import { createApp } from './app.js';
import { validateEnvironment } from './config/env.js';

const environment = validateEnvironment();
const app = createApp();

app.listen(environment.port, () => {
  console.log(`Backend listening on port ${environment.port}`);
});
