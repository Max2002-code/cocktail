const express = require('express')
const authenticateToken = require('../middleware/auth.middleware')
const { readDatabase, writeDatabase } = require('../services/database.service')

const router = express.Router()
router.use(authenticateToken)

router.get('/', async (req, res) => {
    try{
        const userId = req.user.id

        const database = await readDatabase()

        const favorites = database.favorites.filter(
            favorite => favorite.userId === userId && favorite.active === true
        )

        return res.status(200).json(favorites)
    } catch (error){
        console.error(error)

        return res.status(500).json({
            message: "Errore interno del server"
        })
    }
})

router.post("/:userId/toggle", async (req, res) => {
    try{
        const userId = req.user.id
        const cocktailId = String(req.body.cocktailId)

        if(!cocktailId){
            return res.status(400).json({
                message: "cocktailId obbligatorio"
            })
        }

        const database = await readDatabase()

        let favorite = database.favorites.find(
            favorite => favorite.userId === userId && favorite.cocktailId === cocktailId
        )

        if (!favorite){
            favorite = {
                userId: userId, cocktailId: cocktailId, active:true
            }

            database.favorites.push(favorite)
        } else {
            favorite.active = !favorite.active
        }

        await writeDatabase(database)

        return res.status(201).json({
            cocktailId: favorite.cocktailId,
            favorite: favorite.active,
            message: favorite.active ? "Cocketail aggiunto ai preferiti" : "Cocktail rimosso dai preferiti"
        })
    } catch (error){
        console.error(error)

        return res.status(500).json({
            message: "Errore interno del server"
        })
    }
})

module.exports = router