const express = require('express')
const sqlite3 = require('sqlite3')

const timesheetRouter = express.Router({mergeParams: true})
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

timesheetRouter.param('timesheetId', (req, res, next, TimesheetId) => {
    db.get("SELECT * FROM Timesheet WHERE Timesheet.id = $id", 
    {
        $id: TimesheetId
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

timesheetRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Timesheet WHERE employee_id = $id", 
    {
        $id: req.params.employeeId
    }, 
    (error, rows) => {
        if(error) {
            next(error)
        } else {
            res.status(200).send({timesheets: rows})
        }
    })
})

timesheetRouter.post('/', (req, res, next) => {
    if (!req.body.timesheet.hours || !req.body.timesheet.rate || !req.body.timesheet.date) {
        res.status(400).send()
    } else {
        db.run("INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId) ",
        {
            $hours: req.body.timesheet.hours,
            $rate: req.body.timesheet.rate,
            $date: req.body.timesheet.date,
            $employeeId: req.params.employeeId
        }, 
        function(error) {
            db.get("SELECT * FROM Timesheet WHERE id = $id",
            {
                $id: this.lastID
            },
            (error, row) => {
                if(error) {
                    next(error)
                } else {
                    res.status(201).send({timesheet: row})
                }
            })
        })
    }
})

timesheetRouter.put('/:timesheetId', (req, res, next) => {
    if (!req.body.timesheet.hours || !req.body.timesheet.rate || !req.body.timesheet.date) {
        res.status(400).send()
    } else {
        db.run("UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE id = $id ",
        {
            $hours: req.body.timesheet.hours,
            $rate: req.body.timesheet.rate,
            $date: req.body.timesheet.date,
            $employeeId: req.params.employeeId,
            $id: req.params.timesheetId
        },
        (error) => {
            if(error) {
                next(error)
            } else {
                db.get("SELECT * FROM Timesheet WHERE id = $id", 
                {
                    $id: req.params.timesheetId
                },
                (error, row) => {
                    if(error) {
                        next(error)
                    } else {
                        res.status(200).send({timesheet: row})
                    }
                })
            }
        })
    }
})

timesheetRouter.delete('/:timesheetId', (req, res, next) => {
    db.run("DELETE FROM Timesheet WHERE id = $id",
    {
        $id: req.params.timesheetId
    },
    (error) => {
        if(error) {
            next(error)
        } else {
            res.status(204).send()
        }
    })
})

module.exports = timesheetRouter