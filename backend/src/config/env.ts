import 'dotenv/config';

const nodeEnvironments = ['development', 'test', 'production'] as const;

export type NodeEnvironment = (typeof nodeEnvironments)[number];

export interface EnvironmentConfig {
  nodeEnv: NodeEnvironment;
  port: number;
  frontendUrl: string;
  mongoUri: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
}

export class EnvironmentValidationError extends Error {
  public constructor(public readonly issues: readonly string[]) {
    super(`Invalid environment configuration: ${issues.join('; ')}`);
    this.name = 'EnvironmentValidationError';
  }
}

/**
 * Parses only the variables required by the current backend scope. Future
 * credentials are deliberately not validated until their corresponding days.
 */
export function validateEnvironment(
  environment: NodeJS.ProcessEnv = process.env,
): EnvironmentConfig {
  const issues: string[] = [];
  const nodeEnv = environment.NODE_ENV ?? 'development';

  if (!nodeEnvironments.includes(nodeEnv as NodeEnvironment)) {
    issues.push('NODE_ENV must be development, test, or production');
  }

  const portValue = environment.PORT ?? '4000';
  const port = Number(portValue);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    issues.push('PORT must be an integer between 1 and 65535');
  }

  const frontendUrl = environment.FRONTEND_URL;
  if (!frontendUrl) {
    issues.push('FRONTEND_URL is required');
  } else {
    try {
      const parsedUrl = new URL(frontendUrl);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        issues.push('FRONTEND_URL must use http or https');
      }
    } catch {
      issues.push('FRONTEND_URL must be a valid URL');
    }
  }

  const mongoUri = environment.MONGODB_URI;
  if (!mongoUri) issues.push('MONGODB_URI is required');
  else if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    issues.push('MONGODB_URI must use mongodb or mongodb+srv');
  }
  const jwtAccessSecret = environment.JWT_ACCESS_SECRET;
  const jwtRefreshSecret = environment.JWT_REFRESH_SECRET;
  if (!jwtAccessSecret || jwtAccessSecret.length < 32) issues.push('JWT_ACCESS_SECRET must be at least 32 characters');
  if (!jwtRefreshSecret || jwtRefreshSecret.length < 32) issues.push('JWT_REFRESH_SECRET must be at least 32 characters');

  if (issues.length > 0) {
    throw new EnvironmentValidationError(issues);
  }

  return {
    nodeEnv: nodeEnv as NodeEnvironment,
    port,
    frontendUrl: frontendUrl as string,
    mongoUri: mongoUri as string,
    jwtAccessSecret: jwtAccessSecret as string,
    jwtRefreshSecret: jwtRefreshSecret as string,
  };
}
