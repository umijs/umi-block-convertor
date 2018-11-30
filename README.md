umi-block-convertor
===

A cli tool to convert your umi page to a umi block.

Usage
---

```sh
umi-block-convertor [block source entry js] [block target folder]
```

```sh
umi-block-convertor --config [path to config.json]
```

Config
---

A config demo:

```json
{
  "source": "./src/pages/test/Hello.js",
  "target": "../block/hello",
  "extFiles": [
    ["./src/pages/test/model.js", "../block/hello/model.js"],
    ["./src/pages/test/locals", "../block/hello/locals"]
  ]
}
```