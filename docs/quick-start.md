# Quick start

## Installation

```bash
npm install naja
```

Naja comes in the form of an npm package. You can install and `import` it into your code at will.

If you're not friends with npm, you can download the archive from Github and load the bundled script from `dist`
directory into your site.

?> If you like to learn by example, [@f3l1x](https://github.com/f3l1x) has created
[a demo](https://github.com/trainit/2018-03-nette-webpack) which shows how to use Naja in a Nette Framework
application with Webpack.


## Usage

Once you load `naja`, you need to initialize it. You should make sure this happens after the DOM is loaded,
e.g. like this:

```js
document.addEventListener('DOMContentLoaded', naja.initialize.bind(naja));
```

The `initialize()` method loads all Naja's core components plus all registered [extensions](extensions-custom.md).
By default, all links, forms and submit inputs marked with `ajax` class will be handled by Naja.
