import mongoose from 'mongoose';
import Logging from '../library/Logging';
import { IS_DEPLOYED } from '../../server';


/* LOCAL MONGO CONSTANTS */
const DB_NAME = "techshop";

/** DEPLOYED MONGO ATLAS CONSTANTS */
const MONGO_USERNAME = process.env.MONGO_USERNAME || ""
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || ""
const MONGO_URL = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@techshop.7ejxpym.mongodb.net/appName=TechShop`

/* LOCAL MONGO DB CONFIG */
async function connectLocal() {
  try {
    await mongoose.connect(`mongodb://127.0.0.1:27017/${DB_NAME}`);  
    Logging.info(`Established a connection to local MongoDB. Database = ${DB_NAME}`)
  } catch (err) {
    Logging.error(`Error connecting to local MongDB`+ err );
  }
}

/** DEPLOYED MONGO ATLAS CONFIG */
async function connectDeployed(): Promise<void> {
  try {
    await mongoose.connect(MONGO_URL,  { retryWrites: true, w: 'majority'});  
    Logging.info(`Established a connection to MongoDB Atlas`)
  } catch (err) {
    Logging.error(`Error connecting to MongoDB Atlas`+ err );
  }
}

if (IS_DEPLOYED) {
  connectDeployed();
} else {
  connectLocal();
}