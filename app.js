'use strict'
const express = require('express')
const routes = require('./routes')
const config = require('./config')
const { connection } = require('./db')
const { createWgClients, createWgSubnet } = require('./utils')

const app = express()
app.use(express.json())
app.use(express.urlencoded(({ extended: true })))
app.use(routes)

const initApp = async () => {
    try {
        // Connect to MongoDB
        const database = (config.ltse) ? 'LTSE' : 'MongoDB'
        console.log('Connecting to ' + database + '...')
        await connection.connectDb(config.ltse)
        console.log('Connected to ' + database)

        // Create clients from db in wg
        console.log('Creating Wireguard clients...')
        await createWgClients()

        // Create wg subnet
        console.log('Creating Wireguard network...')
        await createWgSubnet()

        app.listen(config.port, () => {
            console.log('Express server listening on port ' + config.port)
        })

    } catch (err) {
        console.error(err.stack)
        process.exit(1)
    }
}

initApp()

module.exports = {
    app
}