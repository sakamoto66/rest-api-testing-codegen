

# Rest Api Testing Codege

Since I operated the browser, only the API is recorded and the code is generated.

## Installation

```bash
npm install -D rest-api-testing-codegen
```

## Usage

```bash
npx rest-api-testing-codegen --baseURL=https://google.co.jp --headers=cookie
```

## Options

| full name | shot name | command line | config file | desc | defaults |
| -- | -- | -- | -- | -- | -- |
| baseURL | u | Y | Y | Opens a browser at the specified URL | |
| indent | i | Y | Y | Indent the output code | 2 spaces |
| output | o | Y | Y | File name of the output code | sample.spec.ts |
| format | f | Y | Y | Format of output code | playwright |
| headers | h | Y | Y | Prints the code only if the specified header is present. | authorization |
| expect | | N | Y | Specify the verification format of the response data. | |
| config | c | Y | N | Specify the configuration file. | rest-api-testing-codegen.config.js |
