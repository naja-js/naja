# Initialization

With `naja` installed and imported, you need to initialize it:

```js
naja.initialize();
```

The `initialize()` method sets up all Naja's core components and extensions. An initialized instance of Naja:

- [hooks onto clicks and submissions of links,](ui-binding.md) forms and submit inputs marked with the `ajax` class and dispatches the respective requests asynchronously;
- [updates the DOM](snippets.md) based on the snippets [sent from the server](https://doc.nette.org/en/ajax);
- [handles redirections](redirection.md) requested by the server;
- records all requests [in the browser history](history.md) and even [caches snippet updates](snippet-cache.md) to provide a more seamless experience to the user;
- integrates with the [nette-forms](forms.md) script if available;
- hooks all [registered extensions](extensions-custom.md) into the request lifecycle;
- exposes [a method to manually dispatch](dispatch.md) an asynchronous request and let Naja handle the server response.


## Options

Naja uses a plain, mutable, request-scoped object called `options` to pass various information and metadata between Naja's components and both built-in and userland extensions.

You can use it to configure most of the aforementioned aspects of Naja's behaviour (refer to respective pages of this guide for details), [alter the behaviour](dispatch.md#configuring-the-request) of the underlying Fetch API call, and pass any information within [custom extensions](extensibility.md).

Each request dispatched by Naja is created with its own `options`; you can preconfigure the default set of `options` via the `naja.initialize()` method:

```js
naja.initialize({
    myOption: 42,
    fetch: {
		credentials: 'include',
    },
});
```
