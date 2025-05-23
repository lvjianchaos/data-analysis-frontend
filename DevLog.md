# 项目初始化

## 项目创建

```shell
npm init vue@latest
```

创建项目的基本信息如下图：

<img src="https://cdn.jsdelivr.net/gh/lvjianchaos/Images/test/%E9%A1%B9%E7%9B%AE%E5%88%9B%E5%BB%BA%E5%9F%BA%E6%9C%AC%E4%BF%A1%E6%81%AF.png" alt="创建信息" style="zoom:50%; float: left;"/>

之后**安装项目所需依赖**，参考`package.json`；成功后，生成`node-modules`目录即为所需依赖

```shell
npm install
```

最后初始化仓库，`git`版本控制管理代码

```bash
git init
```

...

## 插件配置

> **安装VS插件：**
>
> TypeScript Vue Plugin (Volar) <无需安装，已不再维护并使用>
>
> Vue - Official
>
> ESLint

可设置ESlint格式化代码，在此不做表述

## Element Plus按需自动导入配置

>  由于本项目使用`Element Plus`组件库，但每次都要手动引入相应的组件，工作繁杂且易出错；按需导入会使最后打包出的文件体积较小比起完整导入

```shell
npm install element-plus --save 
```

**按需导入**参考官方文档：[按需导入](https://element-plus.org/zh-CN/guide/quickstart.html#%E6%8C%89%E9%9C%80%E5%AF%BC%E5%85%A5) 

> 可能配置过后会造成ts检查时找不到的错误，主要还是我们的ts配置文件没有包含我们的自动导入的配置文件，我的解决方案是在ts的配置文件`./tsconfig.app.json`中的include后添加`"auto-imports.d.ts", "components.d.ts"`，以上。

我们可以继续查看这个按需导入的插件[unplugin-auto-import](https://github.com/unplugin/unplugin-auto-import#install)，可以得到的是，我们也可以在其中添加某些代码来进行开发的简化，比如从`vue`中`import {ref}`等等基础重复的操作，来自动导入相关的函数。

## icon图标自动导入

[安装](https://element-plus.org/zh-CN/component/icon.html#%E5%AE%89%E8%A3%85) 

按照文档说明，继续安装插件 [unplugin-icons](https://github.com/antfu/unplugin-icons)，

```shell
npm i -D unplugin-icons
```

后续参考[此模板](https://github.com/sxzz/element-plus-best-practices/blob/db2dfc983ccda5570033a0ac608a1bd9d9a7f658/vite.config.ts#L21-L58)进行相应配置...

后续图标库的使用只需要在图标前+`IEp`，例如：“`IEpUser`”

## 关于布局

### 草稿设计

此次数据分析的项目，又要包含先前记录的显示，设计的布局类似如下：
<img src="https://cdn.jsdelivr.net/gh/lvjianchaos/Images/test/%E4%B8%BB%E5%BA%94%E7%94%A8%E8%AE%BE%E8%AE%A1%E5%9B%BE.png" alt="布局设计草稿" style="zoom:40%" float="left"/> 

需要说明的是：鼠标点击历史记录时，会从右侧弹出一个历史记录的侧边栏，以时间顺序降序显示，悬浮于用户头像会显示用户的基本信息，而主区域的数据分析的“三部曲”会按照一定顺序进行，在哪一步会进行高亮显示，或者其他低光。

登陆注册页目前按照默认的简陋设计的即可，后续有时间再进行完善。

### 主体布局开发

#### 采用css预处理器`scss`

下载

```shell
npm install -D sass-embedded
```

