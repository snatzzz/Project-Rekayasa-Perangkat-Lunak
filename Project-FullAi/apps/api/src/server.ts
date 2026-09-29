import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import apiRouter from './routes/index.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// Root endpoint as specified in requirements
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Motorcycle API is running',
  })
})

// Mount REST API
app.use('/api', apiRouter)

// Centralized error handling
app.use(errorHandler)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})