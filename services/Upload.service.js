const path = require('path')
const fs = require('fs')
const formidable = require('formidable');
const mime = require('mime-types')

const uploadFile = async (req, name) => {
  try {
    let filename = '';
    let form = new formidable.IncomingForm({
      multiples: false,
      uploadDir: path.join(__dirname, '..', 'public', 'uploads'),
      maxFileSize: 1500 * 1024 * 1024
    });
    // form.multiples = false;
    // form.uploadDir = path.join(__dirname, '..', 'files', name);
    // form.maxFileSize = 500 * 1024 * 1024;

    form.on('file', (field, file) => {
      const ext = file.originalFilename.split('.');
      const extName = ext[ext.length - 1];
      filename = `${file.newFilename}.${extName}`
      fs.renameSync(
        path.join(file.filepath),
        `${path.join(file.filepath)}.${extName}`
      );
    });

    [fields, files] = await form.parse(req);

    return filename
  } catch (e) {
    console.log(e);
    return e
  }
}

module.exports = uploadFile