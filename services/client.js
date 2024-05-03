const { promisify } = require('util')
var { exec } = require('child_process')
exec = promisify(exec)

const Netmask = require('netmask').Netmask
const long2ip = require('netmask').long2ip
const ip2long = require('netmask').ip2long

const config = require('../config')
const { clientDb } = require('../db')
const { getClientByPublicKey, getUsedIPs, insertClientDb, deleteClientDb, enableClientDb, disableClientDb } = clientDb

const createClient = async (publicKey, presharedKey) => {
    try {
        if (!publicKey) throw new Error('The peer\'s public key is needed')
        let clientResult = await getClientByPublicKey(publicKey)
        if (clientResult && clientResult.length > 0) throw new Error(`The client with public key ${publicKey} exists`)

        let usedIPs = await getUsedIPs()
        let totalClientsCount = (config.ltse) ? usedIPs.length : await usedIPs.count()
        if (totalClientsCount >= config.maxClients) throw new Error('Maximum number of clients reached. Not possible no add a new client')

        // find minimum available IP in wg subnet
        let block = new Netmask(config.wgSubnet)
        let firstIP = ip2long(block.first) + 1
        let lastIP = ip2long(block.last)
        let ips = (config.ltse) ? usedIPs.map(i => i.clientIP) : (await usedIPs.toArray()).map(i => i.clientIP)

        let clientIP = firstIP
        while (true) {
            clientIP = Math.floor(Math.random() * (lastIP - firstIP + 1)) + firstIP
            if (!ips.includes(clientIP)) break
        }

        // create wg peer and insert to db
        await exec(`echo "${presharedKey}" > presharedkey`)
        await exec(`wg set wg0 peer ${publicKey} preshared-key presharedkey allowed-ips ${long2ip(clientIP) + '/32'} persistent-keepalive 25`)
        await exec('rm presharedkey')

        const client = {
            clientPublicKey: publicKey,
            presharedKey: presharedKey,
            clientIP: clientIP,
            allowedIPs: config.peerAllowedIPs,
            enabled: true
        }
        await insertClientDb(client)

        // return connection needed data
        let serverPublicKey = (await exec('wg show wg0 public-key')).stdout.replace(/\n/g, '')
        return {
            serverPublicKey: serverPublicKey,
            serverIP: config.serverIP,
            serverPort: config.wgPort,
            // clientPublicKey: publicKey,
            clientIP: long2ip(clientIP) + '/32',
            allowedIPs: config.peerAllowedIPs,
            message: 'Peer added successfully'
        }
    } catch (err) {
        // TODO: if client has been created in db -> delete
        if (err.stderr) throw new Error(err.stderr)
        else throw new Error(err.message)
    }
}

const deleteClient = async (publicKey) => {
    try {
        if (!publicKey) throw new Error('The peer\'s public key is needed')
        let clientResult = await getClientByPublicKey(publicKey)
        if (!clientResult || clientResult?.length === 0) throw new Error(`Client with public key ${publicKey} not found`)
        await exec(`wg set wg0 peer ${publicKey} remove`)
        return await deleteClientDb(publicKey)
    } catch (err) {
        if (err.stderr) throw new Error(err.stderr)
        else throw new Error(err.message)
    }
}

const enClient = async (publicKey) => {
    try {
        if (!publicKey) throw new Error('The peer\'s public key is needed')
        let clientResult = await getClientByPublicKey(publicKey)
        if (!clientResult || clientResult?.length === 0) throw new Error(`Client with public key ${publicKey} not found`)

        await exec(`echo "${clientResult.presharedKey}" > presharedkey`)
        let clientIP = long2ip(clientResult.clientIP) + '/32'
        await exec(`wg set wg0 peer ${publicKey} preshared-key presharedkey allowed-ips ${clientIP} persistent-keepalive 25`)
        await exec('rm presharedkey')
        return await enableClientDb(publicKey)
    } catch (err) {
        if (err.stderr) throw new Error(err.stderr)
        else throw new Error(err.message)
    }
}

const disClient = async (publicKey) => {
    try {
        if (!publicKey) throw new Error('The peer\'s public key is needed')
        let clientResult = await getClientByPublicKey(publicKey)
        if (!clientResult || clientResult?.length === 0) throw new Error(`Client with public key ${publicKey} not found`)

        await exec(`wg set wg0 peer ${publicKey} remove`)
        return await disableClientDb(publicKey)
    } catch (err) {
        if (err.stderr) throw new Error(err.stderr)
        else throw new Error(err.message)
    }
}

module.exports = {
    createClient,
    deleteClient,
    enClient,
    disClient
}