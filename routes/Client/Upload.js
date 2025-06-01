const express = require('express');
const router = express.Router();
const uploadFile = require('../../services/Upload.service')

router.post('/', async (req, res) => {
  const uploadedFilename = await uploadFile(req);

  return res.status(200).json(uploadedFilename)
})

module.exports = router;