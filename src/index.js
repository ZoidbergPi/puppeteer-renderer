'use strict'

const express = require('express')
const qs = require('qs')
const { URL } = require('url')
const contentDisposition = require('content-disposition')
const createRenderer = require('./renderer')
const bodyParser =  require("body-parser");

const port = process.env.PORT || 3000

const app = express()

let renderer = null

// Configure.
app.set('query parser', s => qs.parse(s, { allowDots: true }))
app.disable('x-powered-by')

// Render url.
app.use(bodyParser.json());
app.use('/render',async (req, res, next) => {
  let options=req.body
  let url = options.url
  let type = options.type
  let withhtml = options.withhtml
  let filename = ""
  if (!url) {
    return res.status(400).send('Search with url parameter. For eaxample, ?url=http://yourdomain')
  }

  if (!url.includes('://')) {
    url = `http://${url}`
  }

  try {
    switch (type) {
      case 'pdf':
        const urlObj = new URL(url)
        if (!filename) {
          filename = urlObj.hostname
          if (urlObj.pathname !== '/') {
            filename = urlObj.pathname.split('/').pop()
            if (filename === '') filename = urlObj.pathname.replace(/\//g, '')
            const extDotPosition = filename.lastIndexOf('.')
            if (extDotPosition > 0) filename = filename.substring(0, extDotPosition)
          }
        }
        if(!filename.toLowerCase().endsWith('.pdf')) {
          filename += '.pdf';
        }
        const pdf = await renderer.pdf(url, options)
        res
          .set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdf.length,
            'Content-Disposition': contentDisposition(filename),
          })
          .send(pdf)
        break

      case 'screenshot':
        let { screenshotType, buffer, html_content,final_url } = await renderer.screenshot(url, options)
        if (withhtml) {
          res
            .set({
              'Content-Type': `application/json`,
              'Content-Length': buffer.length + html_content.length,
            })
            .send({
              'image': buffer.toString('base64'),
              'image-type': screenshotType,
              'url': final_url,
              'html': html_content,
              'msg': 'ok',
            })
        }
        else{
          res
          .set({
            'Content-Type': `image/` + screenshotType,
            'Content-Length': buffer.length,
          })
          .send(buffer)
        }
        break

      default:
        const html = await renderer.render(url, options)
        res.status(200).send(html)
    }
  } catch (e) {
    next(e)
  }
})

// Error page.
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).send('Oops, An expected error seems to have occurred.')
})

// Create renderer and start server.
createRenderer({
  ignoreHTTPSErrors: !!process.env.IGNORE_HTTPS_ERRORS,
})
  .then(createdRenderer => {
    renderer = createdRenderer
    console.info('Initialized renderer.')

    app.listen(port, () => {
      console.info(`Listen port on ${port}.`)
    })
  })
  .catch(e => {
    console.error('Fail to initialze renderer.', e)
  })

// Terminate process
process.on('SIGINT', () => {
  process.exit(0)
})
