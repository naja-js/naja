# Writing extensions

## Implementing the extension

Naja requires extensions to implement the `initialize` method which accepts an instance of `Naja`. This method is
where you should bind your event listeners. The rest of the implementation is entirely up to you.

For reference, this is an example implementation of an extension that shows and hides a loading indicator as the request
is sent and completed. The loading indicator is displayed in the closest possible location to the originating element,
determined by the presence of a custom data attribute. This example also illustrates how you can use `options` to pass
information between various event handlers.

```js
class LoadingIndicatorExtension {
    constructor(defaultLoadingIndicatorSelector) {
        this.defaultLoadingIndicatorSelector = defaultLoadingIndicatorSelector;
    }

    initialize(naja) {
        this.defaultLoadingIndicator = document.querySelector(this.defaultLoadingIndicatorSelector);

        naja.uiHandler.addEventListener('interaction', this.locateLoadingIndicator.bind(this));
        naja.addEventListener('start', this.showLoader.bind(this));
        naja.addEventListener('complete', this.hideLoader.bind(this));
    }

    locateLoadingIndicator({detail}) {
        const loadingIndicator = detail.element.closest('[data-loading-indicator]');
        detail.options.loadingIndicator = loadingIndicator || this.defaultLoadingIndicator;
    }

    showLoader({detail}) {
        detail.options.loadingIndicator.classList.add('is-loading');
    }

    hideLoader() {
        detail.options.loadingIndicator.classList.remove('is-loading');
    }
}
```

?> Note that the extension doesn't have to be a class. Even a plain object works just fine as long as it implements the `initialize()` method.


## Registering extensions

The one last step you need to take is to register the extension:

```js
naja.registerExtension(new LoadingIndicatorExtension('#globalLoadingIndicator'));
```

This is best done before calling `naja.initialize()`, but it's not strictly necessary.
