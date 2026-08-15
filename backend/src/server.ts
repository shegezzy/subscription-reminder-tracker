import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { validateEnvironment } from './config/env.js';

async function startServer(): Promise<void> {
  const environment = validateEnvironment();
  await connectDatabase(environment.mongoUri);
  const app = createApp(environment);

  app.listen(environment.port, () => {
    console.log(`Backend listening on port ${environment.port}`);
  });
}

void startServer().catch((error: unknown) => {
  console.error('Unable to start backend server', error);
  process.exitCode = 1;
});
