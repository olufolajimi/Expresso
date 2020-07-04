const express = require('express')
const sqlite3 = require('sqlite3')
const menuItemsRouter = require('./menuItems')

const menusRouter = express.Router()
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

menusRouter.param('menuId', (req, res, next, menuId) => {
    db.get("SELECT * FROM Menu WHERE id = $id",
    {
        $id: menuId
    },
    (error, row) => {
        if(error) {
            next(error)
        } else {
            if(!row) {
                res.status(404).send()
            } else {
                next()
            }
        }
    })
})

menusRouter.use('/:menuId/menu-items', menuItemsRouter)

menusRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Menu",
    (error, rows) => {
        if(error) {
            next(error)
        } else {
            res.status(200).send({menus: rows})
        }
    })
})

menusRouter.post('/', (req, res, next) => {
    if(!req.body.menu.title) {
        res.status(400).send()
    } else {
        db.run("INSERT INTO Menu (title) VALUES ($title) ",
        {
            $title: req.body.menu.title
        },
        function(error) {
            if(error) {
                next(error)
            } else {
                db.get("SELECT * FROM Menu WHERE id = $id",
                {
                    $id: this.lastID
                },
                (error, row) => {
                    if(error) {
                        next(error)
                    } else {
                        res.status(201).send({menu: row})
                    }
                })
            }
        })
    }
})

menusRouter.get('/:menuId', (req, res, next) => {
    db.get("SELECT * FROM Menu WHERE id = $id", 
    {
        $id: req.params.menuId
    },
    (err, row) => {
        if(err) {
            next(err)
        } else {
            res.status(200).send({menu: row})
        }
    })
})

menusRouter.put('/:menuId', (req, res, next) => {
    if(!req.body.menu.title) {
        res.status(400).send()
    } else {
        db.run("UPDATE Menu SET title = $title WHERE id = $id ", 
        {
            $title: req.body.menu.title,
            $id: req.params.menuId
        },
        (error) => {
            if(error) {
                next(error)
            } else {
                db.get("SELECT * FROM Menu WHERE id = $id",
                {
                    $id: req.params.menuId
                },
                (error, menu) => {
                    if(error) {
                        next(error)
                    } else {
                        res.status(200).send({menu: menu})
                    }
                })
            }
        })
    }
})

menusRouter.delete('/:menuId', (req, res, next) => {
    db.get("SELECT * FROM MenuItem WHERE menu_id = $menuId",
    {
        $menuId: req.params.menuId
    },
    (error, row) => {
        if(error) {
            next(error)
        } else {
            if(row) {
                res.status(400).send()
            } else {
                db.run("DELETE FROM Menu WHERE id = $id",
                {
                    $id: req.params.menuId
                },
                (error) => {
                    if(error) {
                        next(error)
                    } else {
                        res.status(204).send()
                    }
                })
            }
        }
    })
})

module.exports = menusRouter;