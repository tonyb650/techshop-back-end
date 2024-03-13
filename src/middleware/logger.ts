import { Request, Response, NextFunction } from 'express'
import { format} from 'date-fns';
import { v4  as uuid } from 'uuid';
import fs from 'fs';
import path from 'path'
import Logging from '../library/Logging';

const fsPromises = fs.promises

/** This is Dave Gray's function to handle logging events. It is used by the middleware below */
export const logEvents = async(message: string, logFileName: string) => {
  const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`

  try {
    if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {                 // If the 'logs' folder doesn't exist...
      await fsPromises.mkdir(path.join(__dirname, '..', 'logs'))              // ... then make the folder
    }
    await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem)  // inside of the 'logs' folder, append the 'logFileName' file with the 'message'
  } catch (err) {
    Logging.error(err)
  }
}

/** This is Dave Gray's logging middleware. When an request is made, the event is added to reqLog.log file AND logged to the console */
export const logger = (req: Request, res: Response, next: NextFunction) => {
  // TODO: filter or somehow manage 'reqLog.log' file so that it doesn't grow huge
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log')
  console.log(`${req.method} ${req.path}`) // TODO Integrate this console.log from Dave Gray with Nerdy Canuck logging function
  next()
}