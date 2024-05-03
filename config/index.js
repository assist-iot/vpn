module.exports = {
    port: process.env.API_PORT || 3000,
    serverIP: process.env.SERVER_IP || '192.168.1.1',
    wgSubnet: process.env.WG_SUBNET || '192.168.2.1/24',
    wgPort: process.env.WG_PORT || 51820,
    maxClients: 0,
    peerAllowedIPs: process.env.PEER_ALLOWED_IPS || '0.0.0.0/0,::/0',
    mongoDbHost: process.env.MONGODB_HOST || 'vpn-db',
    mongoDbPort: process.env.MONGODB_PORT || 27017,
    mongoDbUser: process.env.MONGODB_USER || 'user',
    mongoDbPass: process.env.MONGODB_PASS || 'p4ssw0rd',
    mongoDbDatabase: 'wireguard',
    mongoDbPeersCol: 'peers',
    ltse: process.env.LTSE || true,
    ltseUrl: process.env.LTSE_URL || 'http://ltse-api:8080',
    ltseIndex: process.env.LTSE_INDEX || 'vpn-enabler'
}
