const express = require('express')
const assistantLogger = require('../utils/assistantLogger')
const router = express.Router()
const { chat, search } = require('../controllers/assistantController')

router.use((req, res, next) => {
    req.assistantContext = assistantLogger.createRequestContext('http', {
        method: req.method,
        path: req.originalUrl,
    })

    assistantLogger.info('route', 'Incoming request', {
        requestId: req.assistantContext.requestId,
        method: req.method,
        path: req.originalUrl,
        query: req.method === 'GET' ? req.query : undefined,
        bodyKeys: req.method === 'POST' ? Object.keys(req.body || {}) : undefined,
    })

    const start = Date.now()

    res.on('finish', () => {
        assistantLogger.info('route', 'Request completed', {
            requestId: req.assistantContext.requestId,
            statusCode: res.statusCode,
            durationMs: Date.now() - start,
        })
    })

    next()
})

router.post('/chat', chat)
router.get('/search', search)

module.exports = router
