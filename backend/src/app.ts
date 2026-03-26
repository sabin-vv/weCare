import express from 'express'

import { errorMiddleware } from './core/middleware/errorMiddleware'

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
    res.send('WeCare APi Running')
})

app.use(errorMiddleware)

export default app
