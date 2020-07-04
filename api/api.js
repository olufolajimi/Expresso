const express = require('express')
const employeeRouter = require('./employees')
const menusRouter = require('./menus')

const apiRouter = express.Router()

apiRouter.use('/employees', employeeRouter)
apiRouter.use('/menus', menusRouter)

module.exports = apiRouter;