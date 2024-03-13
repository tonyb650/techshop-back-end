import { Router } from 'express'
import path from 'path'

const catchAllRouter = Router()


catchAllRouter.all('*', (req, res) => {
  res.status(404)
  if (req.accepts('html')){
    res.sendFile(path.join(__dirname,'..', 'views', '404.html')) // TODO the css file is not connecting from the public folder upon deployment
  } else if (req.accepts('json')) {
    res.json({ message: '404 Not Found'})
  } else {
    res.type('txt').send('404 Not Found')
  }
})

export default catchAllRouter