const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

class Logger {
  log(level, message, error = '') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message} ${error}\n`;

    console.log(logMessage);

    fs.appendFileSync(
      path.join(logDir, 'app.log'),
      logMessage
    );
  }

  info(message) {
    this.log('INFO', message);
  }

  error(message, error) {
    this.log('ERROR', message, error?.stack || error);
  }

  warn(message) {
    this.log('WARN', message);
  }
}

module.exports = new Logger();