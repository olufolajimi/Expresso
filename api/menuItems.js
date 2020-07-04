const express = require('express')
const sqlite3 = require('sqlite3')

const menuItemsRouter = express.Router({mergeParams: true})
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
    db.get("SELECT * FROM MenuItem WHERE id = $id",
    {
        $id: menuItemId
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

menuItemsRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId",
    {
        $menuId: req.params.menuId
    },
    (error, rows) => {
        if(error) {
            next(error)
        } else {
            res.status(200).send({menuItems: rows})
        }
    })
})

menuItemsRouter.post('/', (req, res, next) => {
    if(!req.body.menuItem.name || !req.body.menuItem.inventory || !req.body.menuItem.price){
        res.status(400).send()
    } else {
        db.run("INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId) ",
        {
            $name: req.body.menuItem.name,
            $description: req.body.menuItem.description,
            $inventory: req.body.menuItem.inventory,
            $price: req.body.menuItem.price,
            $menuId: req.params.menuId
        },
        function(error) {
            if(error) {
                next(error)
            } else {
                db.get("SELECT * FROM MenuItem WHERE id = $id",
                {
                    $id: this.lastID
                },
                (error, row) => {
                    if(error) {
                        next(error)
                    } else {
                        res.status(201).send({menuItem: row})
                    }
                })
            }
        })
    }
})

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
    if(!req.body.menuItem.name || !req.body.menuItem.inventory || !req.body.menuItem.price){
        res.status(400).send()
    } else {
        db.run("UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId WHERE id = $id ",
        {
            $name: req.body.menuItem.name,
            $description: req.body.menuItem.description,
            $inventory: req.body.menuItem.inventory,
            $price: req.body.menuItem.price,
            $menuId: req.params.menuId,
            $id: req.params.menuItemId
        },
        (error) => {
            if(error) {
                next(error)
            } else {
                db.get("SELECT * FROM MenuItem WHERE id = $id",
                {
                    $id: req.params.menuItemId
                },
                (error, row) => {
                    if(error) {
                        next(error)
                    } else {
                        res.status(200).send({menuItem: row})
                    }
                })
            }
        })
    }
})

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
    db.run("DELETE FROM MenuItem WHERE id = $id",
    {
        $id: req.params.menuItemId
    },
    (error) => {
        if(error) {
            next(error)
        } else {
            res.status(204).send()
        }
    })
})

module.exports = menuItemsRouter