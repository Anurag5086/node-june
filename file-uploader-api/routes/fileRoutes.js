const express = require('express')
const upload = require('../middlewares/multerMiddleware')
const { uploadFile } = require('../controllers/fileController')
const router = express.Router()

router.post('/single-upload', upload.single('file'), uploadFile)

module.exports = router