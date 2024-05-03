const config = require('../config')
const { getDbClient } = require('./conn')

const getClients = async () => {
    try {
        const client = await getDbClient()
        if(config.ltse) {
            const clients = await client.search({
                index: config.ltseIndex,
                size: config.maxClients,
                query: {
                  match_all: {}
                }
            });
            return clients.hits.hits.map(i=>i._source)
        }
        else return await client.db(config.mongoDbDatabase).collection(config.mongoDbPeersCol).find({})
    } catch (err) {
        throw new Error(err.message)
    }
}

const getEnabledClients = async () => {
    try {
        const client = await getDbClient()
        if(config.ltse) {
            const clients = await client.search({
                index: config.ltseIndex,
                size: config.maxClients,
                query: {
                  match: {
                    enabled: true
                  }
                }
            });
            return clients.hits.hits.map(i=>i._source)
        }
        else return await client.db(config.mongoDbDatabase).collection(config.mongoDbPeersCol).find({enabled: true})
    } catch (err) {
        throw new Error(err.message)
    }
}

const getDisabledClients = async () => {
    try {
        const client = await getDbClient()
        if(config.ltse) {
            const clients = await client.search({
                index: config.ltseIndex,
                size: config.maxClients,
                query: {
                  match: {
                    enabled: false
                  }
                }
            });
            return clients.hits.hits.map(i=>i._source)
        }
        else return await client.db(config.mongoDbDatabase).collection(config.mongoDbPeersCol).find({enabled: false})
    } catch (err) {
        throw new Error(err.message)
    }
}

const getClientByPublicKey = async (publicKey) => {
    try {
        const client = await getDbClient()
        if(config.ltse) {
            const clients = await client.search({
                index: config.ltseIndex,
                size: config.maxClients,
                query: {
                  match_phrase: {
                    clientPublicKey: publicKey
                  }
                }
            });
            return clients.hits.hits.map(i=>i._source)
        }
        else return await client.db(config.mongoDbDatabase).collection(config.mongoDbPeersCol).findOne({ clientPublicKey: publicKey })
    } catch (err) {
        throw new Error(err.message)
    }
}

const getUsedIPs = async () => {
    try {
        const client = await getDbClient()
        if(config.ltse) {
            const clients = await client.search({
                index: config.ltseIndex,
                size: config.maxClients,
                query: {
                  match_all: {}
                }
            });
            return clients.hits.hits.map(i=>i._source)
        }
        else return await client.db(config.mongoDbDatabase).collection(config.mongoDbPeersCol).find({}).sort({ clientIP: 1 }).project({ _id: 0, clientIP: 1 }).limit(config.maxClients)
    } catch (err) {
        throw new Error(err.message)
    }
}

const insertClientDb = async (clientData) => {
    try {
        const client = await getDbClient()
        if(config.ltse) {
            return await client.index({
                index: config.ltseIndex,
                document: clientData,
              });
        }
        else return await client.db(config.mongoDbDatabase).collection(config.mongoDbPeersCol).insertOne(clientData)
    } catch (err) {
        throw new Error(err.message)
    }
}

const deleteClientDb = async (publicKey) => {
    try {
        const client = await getDbClient()
        if(config.ltse) {
            return await client.deleteByQuery({
                index: config.ltseIndex,
                refresh: true,
                query: {
                    match_phrase: {
                        clientPublicKey: publicKey,
                    },
                },
            })
        }
        else return await client.db(config.mongoDbDatabase).collection(config.mongoDbPeersCol).deleteOne({
            clientPublicKey: publicKey
        })
    } catch (err) {
        throw new Error(err.message)
    }
}

const enableClientDb = async (publicKey) => {
    try {
        const client = await getDbClient()
        if(config.ltse) {
            return await client.updateByQuery({
                index: config.ltseIndex,
                refresh: true,
                script: {
                    lang: 'painless',
                    source: 'ctx._source["enabled"] = true'
                },
                query: {
                    match_phrase: {
                        clientPublicKey: publicKey,
                    },
                },
            })
        }
        else return await client.db(config.mongoDbDatabase).collection(config.mongoDbPeersCol).updateOne(
            {
                clientPublicKey: publicKey
            },
            {
                $set: {
                    enabled: true
                }
            }
        )
    } catch (err) {
        throw new Error(err.message)
    }
}

const disableClientDb = async (publicKey) => {
    try {
        const client = await getDbClient()
        if(config.ltse) {
            return await client.updateByQuery({
                index: config.ltseIndex,
                refresh: true,
                script: {
                    lang: 'painless',
                    source: 'ctx._source["enabled"] = false'
                },
                query: {
                    match_phrase: {
                        clientPublicKey: publicKey,
                    },
                },
            })
        }
        else return await client.db(config.mongoDbDatabase).collection(config.mongoDbPeersCol).updateOne(
            {
                clientPublicKey: publicKey
            },
            {
                $set: {
                    enabled: false
                }
            }
        )
    } catch (err) {
        throw new Error(err.message)
    }
}

module.exports = {
    getClients,
    getEnabledClients,
    getClientByPublicKey,
    getUsedIPs,
    insertClientDb,
    deleteClientDb,
    enableClientDb,
    disableClientDb
}