const express = require('express')
const sqlite3 = require('sqlite3')
const timesheetRouter = require('./timesheets')

const employeeRouter = express.Router({mergeParams: true})
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')


employeeRouter.param('employeeId', (req, res, next, employeeId) => {
    db.get("SELECT * FROM Employee WHERE Employee.id = $id", 
    {
        $id: employeeId
    },
    (err, row) => {
        if(err) {
            next(err)
        } else {
            if (row) {
                next()
            } else {
                res.status(404).send()
            }
        }
    })
})

employeeRouter.use('/:employeeId/timesheets', timesheetRouter)

employeeRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Employee WHERE is_current_employee = 1", (error, employees) => {
        if (error) {
            next(error)
        } else {
            res.send({employees: employees})
        }
    })
})

employeeRouter.post('/', (req, res, next) => {
    if(!req.body.employee.name || !req.body.employee.position || !req.body.employee.wage) {
        res.status(400).send()
    } else {
        db.run("INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee) ",
        {
            $name: req.body.employee.name,
            $position: req.body.employee.position,
            $wage: req.body.employee.wage,
            $isCurrentEmployee: req.body.employee.isCurrentEmployee ? req.body.employee.isCurrentEmployee : 1
        },
        function(err) {
            if(err) {
                next(err)
            } else {
                db.get("SELECT * FROM Employee WHERE id = $id", 
                {
                    $id: this.lastID
                },
                (err, row) => {
                    if(err) {
                        next(err)
                    } else {
                        res.status(201).send({employee: row})
                    }
                })
            }
        })
    }
})

employeeRouter.get('/:employeeId', (req, res, next) => {
    db.get("SELECT * FROM Employee WHERE id = $id", 
    {$id: req.params.employeeId}, 
    (error, employee) => {
        if(error) {
            next(error)
        } else {
            res.status(200).send({employee: employee})
        }
    })
})

employeeRouter.put('/:employeeId', (req, res, next) => {
    if(!req.body.employee.name || !req.body.employee.position || !req.body.employee.wage) {
        res.status(400).send()
    } else {
        db.run("UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE id = $id ",
        {
            $name: req.body.employee.name,
            $position: req.body.employee.position,
            $wage: req.body.employee.wage,
            $isCurrentEmployee: req.body.employee.isCurrentEmployee ? req.body.employee.isCurrentEmployee : 1,
            $id: req.params.employeeId
        },
        (error) => {
            if(error) {
                next(error)
            } else {
                db.get("SELECT * FROM Employee WHERE id = $id", 
                {
                    $id: req.params.employeeId
                }, (error, employee) => {
                    if(error) {
                        next(error)
                    } else {
                        res.status(200).send({employee: employee})
                    }
                })
            }
        })
    }
})
    
    employeeRouter.delete('/:employeeId', (req, res, next) => {
        db.run("UPDATE Employee SET is_current_employee = 0 WHERE id = $id", 
        {
            $id: req.params.employeeId
        }, 
        (error) => {
            if(error) {
                next(error)
            } else {
                db.get("SELECT * FROM Employee WHERE id = $id", 
                {
                    $id: req.params.employeeId
                }, 
                (error, employee) => {
                    if(error) {
                        next(error)
                    } else {
                        res.status(200).send({employee: employee})
                    }
                })
            }
        })
    })

module.exports = employeeRouter;