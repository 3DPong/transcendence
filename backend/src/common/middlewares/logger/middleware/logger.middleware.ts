import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common';
import { colorist, colours } from '../utils';

export function LoggerMiddleware(request: Request, response: Response, next: NextFunction) {
  const logger = new Logger();
  const startAt = process.hrtime();
  const { ip, method, originalUrl } = request;

  logger.log(colorist(`REQUEST`, `${method} to ${originalUrl} from ${ip}`, ``));
  response.on('finish', () => {
    const { statusCode } = response;
    const diff = process.hrtime(startAt);
    const responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toPrecision(1).toString();
    const coloredStatusCode =
      (statusCode < 400 ? colours.fg.cyan : colours.fg.red) + '<' + statusCode + '>' + colours.reset;

    logger.log(
      colorist(`RESPONSE`, `${coloredStatusCode} ${method} to ${originalUrl} from ${ip}`, `+${responseTime}ms`)
    );
  });

  next();
}
