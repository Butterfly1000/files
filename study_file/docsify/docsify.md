# docsify

#### 安装docsify-cli工具

推荐全局安装 `docsify-cli` 工具，可以方便地创建及在本地预览生成的文档。

```bash
#用npm安装全局工具
npm i docsify-cli -g
```

```
npm ERR! request to https://registry.npmjs.org/docsify-cli failed, reason: unable to get local issuer certificate

npm config set registry https://registry.npmmirror.com

好像也没啥用

忽略 SSL 证书： 作为临时解决方案，您可以配置 npm 忽略 SSL 证书验证。这不是推荐的做法，因为它会降低安全性，但可以作为短期的解决方案。(有效)
npm config set strict-ssl false
```

#### 初始化项目

如果想在项目的 `.` 当前目录里写文档，直接通过 `docsify init .` 初始化项目

初始化成功后，可以看到 `.` 目录下创建的几个文件

- `index.html` 入口文件
- `README.md` 会做为主页内容渲染
- `.nojekyll` 用于阻止 GitHub Pages 忽略掉下划线开头的文件



```
# 初始化文档站点
docsify init study_file

# 启动本地服务器
docsify serve study_file
```

#### 本地预览

通过运行 `docsify serve .` 启动一个本地服务器，这里的点就是当前目录的意思，可以方便地实时预览效果。默认访问地址 [http://localhost:3000](http://localhost:3000/) 。也可以用-p指定端口。

```bash
docsify serve -p 80 .
```

[工具--docsify详解](https://blog.csdn.net/liyou123456789/article/details/124504727)