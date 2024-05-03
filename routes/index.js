const express = require('express')
const router = express.Router()
const { commonController, wgInfoController, keysController, clientController } = require('../controllers')

router.get('/version', commonController.version)
router.get('/health', commonController.health)
router.get('/api-export', commonController.openApi)

router.get('/info', wgInfoController.wgInfo)
router.get('/info/conf', wgInfoController.wgConf)

router.get('/keys', keysController.keys)

router.post('/client', clientController.newClient)
router.delete('/client', clientController.removeClient)
router.put('/client/enable', clientController.enableClient)
router.put('/client/disable', clientController.disableClient)

module.exports = router