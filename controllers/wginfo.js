const { wgInfoService } = require('../services')
const { getWgInfo, showWgConf } = wgInfoService

const wgInfo = async (req, res) => {
    try {
        const result = await getWgInfo()
        res.status(200).send(result)
    } catch (err) {
        console.error(err.stack)
        res.status(500).send({ message: err.message })
    }
}

const wgConf = async (req, res) => {
    try {
        const result = await showWgConf()
        res.status(200).send(result)
    } catch (err) {
        console.error(err.stack)
        res.status(500).send({ message: err.message })
    }
}

module.exports = {
    wgInfo,
    wgConf
}

