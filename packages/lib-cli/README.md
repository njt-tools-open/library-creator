# @njt-tools-open/lib-cli

<br>

<a title="lib-cli Downloads">
  <img src="https://img.shields.io/npm/dm/%40njt-tools-open%2Flib-cli" alt="Downloads per Month"/>
</a>

<a title="lib-cli Downloads">
  <img src="https://img.shields.io/npm/dy/%40njt-tools-open%2Flib-cli" alt="Downloads per Year"/>
</a>

<a href="https://badge.fury.io/js/%40njt-tools-open%2Flib-cli" title="NPM Version Badge">
   <img src="https://img.shields.io/npm/v/%40njt-tools-open%2Flib-cli.svg?sanitize=true" alt="version">
</a>

<br>

Easy to create a library as single or multiple mode.

## Quick Overview

```sh
# install global or use npx
npm install @njt-tools-open/lib-cli -g
# create a library template
lib-cli create my-lib

cd my-lib
```

## Commands

### dev

```
npm run dev
```

### build

```
npm run build
```

### inject env

```js
// <project_folder>/lib-cli.env.js
module.exports = {
  NODE_ENV: 'development',
};
```
