# Quick start

```bash
npm install naja
```

```js
import naja from 'naja';
naja.initialize();
```

The `initialize()` method loads all Naja's core components plus all registered [extensions](extensions-custom.md). By default, all links, forms and submit inputs marked with `ajax` class will be handled by Naja.
