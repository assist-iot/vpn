const { promisify } = require('util')
var { exec } = require('child_process')
exec = promisify(exec)

const generateKeys = async () => {
    try {
        let presharedKey = (await exec('wg genpsk')).stdout.replace(/\n/g, '')
        let privateKey = (await exec('wg genkey')).stdout.replace(/\n/g, '')
        let publicKey = (await exec(`echo "${privateKey}" | wg pubkey`)).stdout.replace(/\n/g, '')

        return {
            public: publicKey,
            private: privateKey,
            preshared: presharedKey
        }

    } catch (err) {
        throw new Error(err.stderr)
    }
}

module.exports = {
    generateKeys
}