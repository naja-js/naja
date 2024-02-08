# Installation

## From a package manager

The recommended way of installing Naja is to use a package manager such as NPM or Yarn:

```bash
npm install naja
# or
yarn add naja
```

You can then import a ready-made instance of `naja` into your own code:

```js
import naja from 'naja';
```

?> You should use a module bundler (such as [Webpack](https://webpack.js.org), [Rollup](https://rollupjs.org), [Vite](https://vitejs.dev), [Parcel](https://parceljs.org) and more) to build a production-ready script. 

## From a CDN or a local file

Alternatively, you can load Naja directly into your site from a CDN such as UNPKG, or a self-hosted bundled version of Naja which you can download from the [releases archive](https://github.com/naja-js/naja/releases) on Github:

```html
<script src="https://unpkg.com/naja@3/dist/Naja.min.js"></script>
```

Naja is then exposed via the `naja` variable in the global context.
