# Install and set up Naja

?> If you want to follow along with the tutorial, make sure to check out the `follow-along` branch and start from there.

Now that we're familiar with the project structure, we can start AJAX-ifying the application. The first step is to install Naja. We'll do it the preferred way, which is using a package manager. The project is already set up to use NPM, so let's stick with it:

```sh
npm install naja
```

This installs the latest version of Naja and its dependencies into the `node_modules` directory and records the specific installed versions into `package-lock.json` so that your colleagues will get the exact same versions when they set up the project later.

?> You can learn more about alternative ways to install Naja in [Installation](/installation.md).

## Initialization

To initialize Naja, all we have to do is to import it and call its `initialize()` method. Let's open the `index.js` file and add the import to the beginning of the file:

```js
import naja from 'naja';
```

And place the initialization at the bottom:

```js
naja.initialize();
```

Please note that for the `import` to work properly in the browser, you need to process the code with a module bundler. This project uses [Webpack](https://webpack.js.org) to create a client-side bundle and [contributte/webpack](https://github.com/contributte/webpack) to integrate it into Nette Framework.

?> You can learn more about Naja's initialization in [Initialization](/initialization.md).

If you open the website in the browser, you won't notice any change in the behaviour of the application just yet. In the next chapter, we'll bind Naja's handlers to UI elements and mark specific pieces of the page as snippets.
