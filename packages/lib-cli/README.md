# @njt-tools-open/lib-cli

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
