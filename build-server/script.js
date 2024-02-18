const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const mime = require('mime-types')
require('dotenv').config();

//TODO:connect aws client
const s3Client = new S3Client({
  region: ap - south - 1
  credentials: {
    accessKeyId: ,
    secretAccessKey: process.env.SECRETACCESSKEY
  }
})

const PROJECT_ID = process.env.PROJECT_ID
async function init() {
  console.log('Executing script.js')
  const outDirPath = path.join(__dirname, 'output')

  const p = exec(`cd ${outDirPath} && npm install && npm run build`)

  p.stdout.on('data', function(data) {
    console.log(data.toString())
  })

  p.stdout.on('error', function(data) {
    console.log('Error', data.toString())
  })

  p.on('close', async function() {
    console.log('Build Complete')
    const distFolderPath = path.join(__dirname, 'output', 'dist')
    const distFolderContents = fs.readdirSync(distFolderPath, {
      recursive: true
    })
    for (const file of distFolderContents) {
      const filePath = path.join(distFolderPath, file)
      if (fs.lstatSync(filePath).isDirectory()) continue;
      console.log('uploading', filePath)
      const command = new PutObjectCommand({
        Bucket: 'vercel-clone-1115',
        Key: `__output/${PROJECT_ID}/${filePath}`,
        Body: fs.createReadStream(filePath),
        ContentType: mime.lookup(filePath)
      })

      try {
        await s3Client.send(command)
        console.log('uploaded', filePath)
      } catch (error) {
        console.error('Error uploading file:', error)
      }
    }
    console.log('Done...')
  })
}

init()
