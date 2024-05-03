const { keysService } = require('../services')
const { generateKeys } = keysService

const keys = async (req, res) => {
    try {
        const keys = await generateKeys()
        res.status(200).send(keys)
    } catch (err) {
        console.error(err.stack)
        res.status(500).send({ message: err.message })
    }
}

module.exports = {
    keys
}
