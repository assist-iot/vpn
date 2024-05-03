const { promisify } = require('util')
var { exec } = require('child_process')
exec = promisify(exec)

const getWgInfo = async () => {
    try {
        return (await exec('wg show wg0')).stdout
    } catch (err) {
        throw new Error(err.stderr)
    }
}

const showWgConf = async () => {
    try {
        return (await exec('wg showconf wg0')).stdout
    } catch (err) {
        throw new Error(err.stderr)
    }
}

module.exports = {
    getWgInfo,
    showWgConf
}