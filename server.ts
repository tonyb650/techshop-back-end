import express from 'express'
import userRouter from './src/routes/user.routes'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import Logging from './src/library/Logging'
import path from 'path'
import rootRouter from './src/routes/root.routes'
import catchAllRouter from './src/routes/catchall.routes'
import { logEvents, logger } from './src/middleware/logger'
import { errorHandler } from './src/middleware/errorHandler'
import mongoose from 'mongoose'
import noteRouter from './src/routes/note.routes'

dotenv.config() // loads environmental variables to whole project

/** Specify allowed origins for CORS options as defined below (Note that Dave Gray put this in a separate file in the config folder)*/
const allowedOrigins = [
  'http://localhost:5173',
  'http://weddingwordsmith.com', 
  'https://weddingwordsmith.com', 
  'http://api.weddingwordsmith.com', 
  'https://api.weddingwordsmith.com', 
  'http://www.weddingwordsmith.com', 
  'https://www.weddingwordsmith.com'
]

/** Set up cors options object for CORS middleware below (Note that Dave Gray also put this in a separate file in the config folder)*/
const corsOptions = {                                       // TODO review documentation for cors middleware to understand this better and maybe clean up types
  origin: (origin: string | undefined, callback: (err: Error | null, origin?: boolean | string | RegExp | Array<boolean | string | RegExp>) => void) =>  {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 ){ //successful
      callback(null, true)
    } else {                                                //fails
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,                                         // sets 'access-control-allow-credentials' header for you
  optionsSuccessStatus: 200
}

const app = express()
const PORT: number = 8000 // Express port
app.use(logger)

/* Middleware for logging request and response - This comes from Nerdy Canuck */
// TODO combine this with Dave Gray logging and move to middleware folder 
app.use((req, res, next) => {
  Logging.info(`Incoming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`)
  res.on('finish', () => {
    if( res.statusCode > 399){
      Logging.warn(`Outgoing -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] -> Status: [${res.statusCode}]`)
    } else {
      Logging.info(`Outgoing -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] -> Status: [${res.statusCode}]`)
    }
  })
  next();
})

app.use(cookieParser());
app.use(express.json()); // Middleware will process JSON
app.use(express.urlencoded({extended:true})); // Middleware for bodyParser
// review 'API Rules' on Nerdy Canuck ~17:00

// Fetch sends an "OPTIONS" pre-flight request
// app.use(cors({ origin: allowedOrigins, allowedHeaders: ['Content-Type', 'Authorization'], credentials: true }))
app.use(cors(corsOptions))
require('./src/config/mongoose.config'); // start database connection here

/** BRING IN ALL ROUTES STARTING HERE */
/** Healthcheck route*/
app.get('/ping', (req, res, next) => res.status(200).json({ message: 'pong'}))

/** Static Files Route */
app.use('/' , express.static(path.join(__dirname, 'public'))) // 'path' is from NodeJS. Listens for root route. __dirname is a global variable. We're telling Express where to find static files.

/** Root Router */
app.use(rootRouter)

/** API routes here */
app.use(userRouter)
app.use(noteRouter)

/** Catchall (404) */
app.use(catchAllRouter)

/** Finally, add errorHandler that: adds error to log, logs error to console, sets res.status and res.json */
app.use(errorHandler)

mongoose.connection.once('open', () => {                                          // Wrap Express listener in mongoose.connection.once so that Express won't start without a connection to Mongo first
  app.listen(PORT, ()=> Logging.info(`Express is listening on port: ${PORT}`))
})

// TODO: Try to figure out the interface for 'err' below. Not MongooseError, not Error, not mongoose.Error. Is a "MongoDB" error?
mongoose.connection.on('error', (err): void => {
  Logging.error(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`)
  logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,'mongoErrLog.log')
})
