# Quick start

## Installation

Naja comes in the form of an NPM package. You can install it via your package manager of choice, and `import` it into your code at will.

```bash
npm install naja
```

```js
import naja from 'naja';
```

If you're not friends with package managers, you can load a bundled version of Naja directly into your site, e.g. from a CDN, or downloaded from the [releases archive](https://github.com/naja-js/naja/releases):

```html
<script src="https://unpkg.com/naja@3/dist/Naja.min.js"></script>
```

Naja is then exposed via the `naja` variable in the global context.


## Initialization

```js
naja.initialize();
```

The `initialize()` method loads all Naja's core components plus all registered [extensions](extensions-custom.md). By default, all links, forms and submit inputs marked with `ajax` class will be handled by Naja.

Please follow to the [initialization](initialization.md) page to learn more about what Naja can do for you.

?> If you like to learn by example, you can also [take the tutorial](guide/00-introduction.md).
