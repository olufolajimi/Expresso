const express = require('express')
const sqlite3 = require('sqlite3')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const errorHandler = require('errorhandler')

const apiRouter = require('./api/api')

const app = express()
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

app.use(morgan('dev'))
app.use(bodyParser())
app.use(cors())
app.use(errorHandler())

app.use('/api', apiRouter)

const PORT = process.env.PORT || 4000

app.listen(PORT)

module.exports = app;