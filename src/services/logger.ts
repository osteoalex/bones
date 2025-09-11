import { app } from 'electron';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

const LOG_FILE_NAME = 'bones-app.log';

function getLogFilePath(): string {
  const userDataPath = app.getPath('userData');
  return join(userDataPath, LOG_FILE_NAME);
}

export function logErr(message: string, error?: unknown) {
  const logFile = getLogFilePath();
  const logDir = dirname(logFile);
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
  }
  const timestamp = new Date().toISOString();
  let entry = `[${timestamp}] ERROR: ${message}`;
  if (error) {
    entry += `\n${error instanceof Error ? error.stack || error.message : String(error)}`;
  }
  entry += '\n';
  appendFileSync(logFile, entry, { encoding: 'utf8' });
}
