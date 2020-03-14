With few feature

# Puppeteer(Chrome headless node API) based web page renderer

[Puppeteer](https://github.com/GoogleChrome/puppeteer) (Chrome headless node API) based web page renderer.

Useful server side rendering through proxy. Outputs HTML, PDF and screenshots as PNG.

## Requirements
You can run Chromium or docker.

## Getting Started

### Install dependencies.
`npm install`

### Start server (If you can run Chromium)
`npm start`

(service port: 3000)

### Using Docker to run (If you can not run Chromium and installed docker)

### Build a docker image
`docker build . -t puppeteer-render-image`

### Start server using docker(Limit Memory Usage to 2G, you can change by yourself)
`docker run -d --name puppeteer-render --memory=2G -p 8000:3000  --restart=always  puppeteer-render-image`

### Test on your browser

Please use POST method call instead


## Integration with existing service.

If you have active service, set proxy configuration with middleware.
See [puppeteer-renderer-middleware](middleware/README.md) for express.

```js
const renderer = require('puppeteer-renderer-middleware');

const app = express();

app.use(renderer({
  url: 'http://installed-your-puppeteer-renderer-url',
  // userAgentPattern: /My-Custom-Agent/i,
  // excludeUrlPattern: /*.html$/i
  // timeout: 30 * 1000,
}));

// your service logics..

app.listen(8080);
```

## API

| Name    | Required | Value               | Description            |Usage                                                         |
|---------|:--------:|:-------------------:|------------------------|--------------------------------------------------------------|
|`url`    | yes      |                     |Target URL              |`{"url":"http://www.google.com"}`         |
|`type`   |          |`pdf` or `screenshot`|Rendering another type. |`{"url":"http://www.google.com","type":"screenshot"}`|
|`withhtml`|      |Not Attach or some value.|When screenshot page ,output base64 image and html source |`{"url":"http://www.google.com","type":"screenshot","withhtml":true}`|
|`useragent`   |          |Not Attach or some value.|Change Page Useragent settings|`{"useragent":"some string"}`|
|(Extra options)|    |                     |Extra options (see [puppeteer API doc](https://github.com/GoogleChrome/puppeteer/blob/v1.1.0/docs/api.md#pagepdfoptions)) |`http://puppeteer-renderer?url=http://www.google.com&type=pdf&scale=2`|

## PDF File Name Convention

Generated PDFs are returned with a `Content-disposition` header requesting the browser to download the file instead of showing it.
The file name is generated from the URL rendered:

| URL                                           | Filename                     |
|-----------------------------------------------|------------------------------|
| `https://www.example.com/`                    | `www.example.com.pdf`        |
| `https://www.example.com:80/`                 | `www.example.com.pdf`        |
| `https://www.example.com/resource`            | `resource.pdf`               |
| `https://www.example.com/resource.extension`  | `resource.pdf`               |
| `https://www.example.com/path/`               | `path.pdf`                   |
| `https://www.example.com/path/to/`            | `pathto.pdf`                 |
| `https://www.example.com/path/to/resource`    | `resource.pdf`               |
| `https://www.example.com/path/to/resource.ext`| `resource.pdf`               |


## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2017-present, Yeongjin Lee
