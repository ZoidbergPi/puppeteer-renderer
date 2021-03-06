'use strict'

const puppeteer = require('puppeteer')

class Renderer {
  constructor(browser) {
    this.browser = browser
  }

  async createPage(url, options) {
    const { timeout, waitUntil, credentials, emulateMedia, ...extraOptions } = options
    const page = await this.browser.newPage()
    if (emulateMedia) {
      await page.emulateMedia(emulateMedia);
    }
    if (extraOptions.useragent){
        await page.setUserAgent(extraOptions.useragent)
      }

    if (credentials) {
      await page.authenticate(credentials)
    }

    await page.goto(url, {
      timeout: Number(timeout) || 30 * 1000,
      waitUntil: waitUntil || 'networkidle2',
    })
    return page
  }

  async render(url, options = {}) {
    let page = null
    try {
      const { timeout, waitUntil, credentials } = options
      page = await this.createPage(url, options)
      const html = await page.content()
      return html
    } finally {
      if (page) {
        await page.close()
      }
    }
  }

  async pdf(url, options = {}) {
    let page = null
    try {
      const { timeout, waitUntil, credentials, ...extraOptions } = options
      options.emulateMedia = 'print'
      page = await this.createPage(url, options)

      const { scale = 1.0, displayHeaderFooter, printBackground, landscape } = extraOptions
      const buffer = await page.pdf({
        ...extraOptions,
        scale: Number(scale),
        displayHeaderFooter: displayHeaderFooter === 'true',
        printBackground: printBackground === 'true',
        landscape: landscape === 'true',
      })
      return buffer
    } finally {
      if (page) {
        await page.close()
      }
    }
  }

  async screenshot(url, options = {}) {
    let page = null
    let html_content = null
    try {
      const { timeout, waitUntil, credentials, ...extraOptions } = options
      page = await this.createPage(url, options)
      page.setViewport({
        width: Number(extraOptions.width || 800),
        height: Number(extraOptions.height || 600),
      })


      const { fullPage, omitBackground, screenshotType, quality, ...restOptions } = extraOptions
      const buffer = await page.screenshot({
        ...restOptions,
        type: screenshotType || 'png',
        quality:
          Number(quality) || (screenshotType === undefined || screenshotType === 'png' ? 0 : 100),
        fullPage: fullPage === 'true',
        omitBackground: omitBackground === 'true',
      })
      html_content = await page.content()
      const final_url = page.url()
      return {
        screenshotType,
        buffer,
        html_content,
        final_url,
      }
    } finally {
      if (page) {
        await page.close()
      }
    }
  }

  async close() {
    await this.browser.close()
  }
}

async function create(options = {}) {
  const browser = await puppeteer.launch(
    Object.assign({args: ['--no-sandbox']}, options)
  )
  return new Renderer(browser)
}

module.exports = create
