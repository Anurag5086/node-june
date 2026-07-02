function formatMeta(meta = {}) {
    if (!meta || Object.keys(meta).length === 0) return ''
    return ` ${JSON.stringify(meta)}`
}

function log(level, step, message, meta) {
    const prefix = `[assistant:${step}]`
    const line = `${prefix} ${message}${formatMeta(meta)}`

    if (level === 'error') {
        console.error(line)
        return
    }

    if (level === 'warn') {
        console.warn(line)
        return
    }

    console.log(line)
}

function createRequestContext(source, meta = {}) {
    return {
        requestId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        source,
        startedAt: Date.now(),
        ...meta,
    }
}

function elapsedMs(ctx) {
    return Date.now() - ctx.startedAt
}

module.exports = {
    info(step, message, meta) {
        log('info', step, message, meta)
    },
    warn(step, message, meta) {
        log('warn', step, message, meta)
    },
    error(step, message, meta) {
        log('error', step, message, meta)
    },
    createRequestContext,
    elapsedMs,
}
