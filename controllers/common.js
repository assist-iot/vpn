const { wgInfoService } = require('../services')
const { getWgInfo } = wgInfoService

const version = async (req, res) => {
	res.status(200).send({ 
		enabler: 'VPN enabler',
		version: process.env.npm_package_version 
	});
}

const health = async (req, res) => {
	// Check Wireguard network and db
	try {
		await getWgInfo()
		return res.status(200).send()
	} catch (e) {
		return res.status(500).send()
	}
}

const openApi = async (req, res) => {
  try {
    const openApiSchema = require('../doc/openapi.json')
	  res.status(200).send(openApiSchema)
  } catch (error) {
    return res.status(500).send()
  }
	
}

module.exports = {
  version,
  health,
  openApi
}