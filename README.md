![npm](https://img.shields.io/npm/v/reepack)
#### 文件内容抽取打包工具

___使用步骤:

##### install repack

###### Environmental.Node
```bash
npm install reepack -D
```

###### Environmental.Deno
```bash
deno install --allow-read --allow-write --allow-run --allow-env -n repack https://raw.githubusercontent.com/0x1af2aec8f957/reepack/deno/cli.ts
```

##### @workDir/repack.config.js

###### Environmental.Node
```javascript
module.exports = {
  output: { // 输出
    ext: '.yml', // 文件后缀
    dir: 'bindRelationShip_output', // 输出文件夹
  },
  input: { // 输入
    ext: '.vue', // 文件后缀
    dir: 'src', //输入文件夹
  },
  // isFlat: true, // 是否递归
  // sep = '.', // 片段分隔符
  extract: /<i18n>([\S\s]*)<\/i18n>/, // 需要提取的正则表达式
  // hasManifest, // 是否生成清单
  // rewrite, // 重写[exec Regex] 需要返回你处理的结果，这将覆盖程序处理结果
};

```

###### Environmental.Deno
```javascript
export default {
  output: { // 输出
    ext: '.yml', // 文件后缀
    dir: 'bindRelationShip_output', // 输出文件夹
  },
  input: { // 输入
    ext: '.vue', // 文件后缀
    dir: 'src', //输入文件夹
  },
  // isFlat: true, // 是否递归
  // sep = '.', // 片段分隔符
  extract: /<i18n>([\S\s]*)<\/i18n>/, // 需要提取的正则表达式
  // hasManifest, // 是否生成清单
  // rewrite, // 重写[exec Regex] 需要返回你处理的结果，这将覆盖程序处理结果
};

```

##### command

```bash
repack i  # 执行输入
repack o  # 执行输出
```

___NodeJs运行时需要注意：


___工具使用了一些新的fs操作接口，你的node版本需要大于11.0.0，才能使用这个工具！___
