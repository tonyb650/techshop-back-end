import { Router } from 'express'
import path from 'path'

const rootRouter = Router()

/** Get the index.html file if it matches any of the 3 below */
rootRouter.get('^/$|index(.html)?', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))// TODO the css file is not connecting from the public folder upon deployment
} )

export default rootRouter