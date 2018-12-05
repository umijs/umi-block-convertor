umi-block-convertor
===

A cli tool to convert your umi page to a umi block.

Usage
---

```shell
$ umi-block-convertor [block source entry js] [block target folder]
```

```shell
$ umi-block-convertor --config [path to config.json]
```

Config
---

A config demo:

```json
// all path relative to process.cwd()
{
  "source": "./src/pages/test/Hello.js",
  "target": "../block/hello",
  "extFiles": [
    ["./src/pages/test/model.js", "src/model.js"],
    ["./src/pages/test/locals", "src/locals"]
  ]
}
```