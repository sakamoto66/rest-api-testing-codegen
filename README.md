

# Rest Api Testing Codege

Since I operated the browser, only the API is recorded and the code is generated.

## Installation

```bash
npm install -D rest-api-testing-codegen
```

## Usage

1. generate test code

```bash
npx rest-api-testing-codegen --baseURL=https://google.co.jp --headers=cookie
```

2. install `@playwright/test` for test code

```bash
npm i -D @playwright/test
```

3. run test code

```bash
npx playwright test sample.spec.ts
```

## Options

| full name | shot name | command line | config file | desc | defaults |
| -- | -- | -- | -- | -- | -- |
| baseURL | u | Y | Y | Opens a browser at the specified URL | |
| indent | i | Y | Y | Indent the output code | 2 spaces |
| output | o | Y | Y | File name of the output code | sample.spec.ts |
| format | f | Y | Y | Format of output code | playwright |
| headers | h | Y | Y | Prints the code only if the specified header is present. | |
| ignoreheaders |  | Y | Y | Specifies headers to exclude from validation | referer,content-type,content-length |
| skipheaders |  | Y | Y | Skips the header output. | false |
| expect | | N | Y | Specify the verification format of the response data. | |
| config | c | Y | N | Specify the configuration file. | rest-api-testing-codegen.config.js |
| resourceType |  | Y | Y | Specifies the resource type to validate. ex) all, document, stylesheet, image, media, font, script, texttrack, xhr, | skipexpectjson |  | Y | Y | Skips generate expect of json. | false |
fetch, eventsource, websocket, manifest, other | xhr |

## Setting Config

- rest-api-testing-codegen.config.js

```javascript
const config = {
    baseURL:"https://google.co.jp/",
    output:"hoge.spec.ts",
    headers:["cookie"]
};
module.exports = config;
```
