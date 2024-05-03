const { clientService } = require('../services')
const { createClient, deleteClient, enClient, disClient } = clientService

const newClient = async (req, res) => {
    try {
        const { publicKey, presharedKey } = req.body
        const client = await createClient(publicKey, presharedKey)
        res.status(200).send(client)
    } catch (err) {
        console.error(err.stack)
        if (err.message) res.status(400).send({ message: err.message })
        else res.status(500).send()
    }
}

const removeClient = async (req, res) => {
    try {
        const { publicKey } = req.body
        await deleteClient(publicKey)
        res.status(200).send()
    } catch (err) {
        console.error(err.stack)
        if (err.message) res.status(400).send({ message: err.message })
        else res.status(500).send()
    }
}

const enableClient = async (req, res) => {
    try {
        const { publicKey } = req.body
        await enClient(publicKey)
        res.status(204).send()
    } catch (err) {
        console.error(err.stack)
        if (err.message) res.status(400).send({ message: err.message })
        else res.status(500).send()
    }
}

const disableClient = async (req, res) => {
    try {
        const { publicKey } = req.body
        await disClient(publicKey)
        res.status(204).send()
    } catch (err) {
        console.error(err.stack)
        if (err.message) res.status(400).send({ message: err.message })
        else res.status(500).send()
    }
}

module.exports = {
    newClient,
    removeClient,
    enableClient,
    disableClient
}