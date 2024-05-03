const { promisify } = require('util')
var { exec } = require('child_process')
exec = promisify(exec)

const Netmask = require('netmask').Netmask
const long2ip = require('netmask').long2ip
const ip2long = require('netmask').ip2long

const config = require('../config')
const { clientDb } = require('../db')

// wg network
const createWgSubnet = async () => {
    const wgInterfaceIP = config.wgSubnet.split('/')[0]
    var block = new Netmask(config.wgSubnet)

    config.maxClients = block.size - 3
    console.log('WG subnet: ' + block.base + '/' + block.bitmask)
    console.log('WG subnet first IP: ' + block.first)
    console.log('WG subnet last IP: ' + block.last)
    console.log('WG max clients: ' + config.maxClients)
    console.log('WG interface IP: ' + wgInterfaceIP)

    if (ip2long(wgInterfaceIP) > ip2long(block.last) || ip2long(wgInterfaceIP) < ip2long(block.first)) throw new Error('Wireguard interface subnet not valid: wg interface IP is outside of the subnet')
    else if (block.size < 4) throw new Error('Wireguard interface subnet not valid: insuficient available number of IPs in the subnet')
}

// Create clients from db in wg
const createWgClients = async () => {
    // TODO if LTSE check if index exists
    const clients = await clientDb.getEnabledClients()
    for await (let i of clients) {
        try {
            await exec(`echo "${i.presharedKey}" > presharedkey`)
            await exec(`wg set wg0 peer ${i.clientPublicKey} preshared-key presharedkey allowed-ips ${long2ip(i.clientIP) + '/32'} persistent-keepalive 25`)
            await exec('rm presharedkey')
        } catch (err) {
            throw new Error(err.message)
        }
    }
}

module.exports = {
    createWgSubnet,
    createWgClients
}