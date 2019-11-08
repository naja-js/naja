# Writing extensions

## Implementing the extension

The extension receives in its constructor the instance of `Naja` and also additional arguments if provided. The
constructor is where you should bind your event listeners. The rest of the implementation is entirely up to you.

For reference, this is an example implementation of an extension that shows and hides a loading indicator as the request
is sent and completed. The loading indicator is displayed in the closest possible location to the originating element.

```js
class LoadingIndicatorExtension {
    constructor(naja, defaultLoadingIndicatorSelector) {
        naja.addEventListener('init', () => {
            this.defaultLoadingIndicator = document.querySelector(defaultLoadingIndicatorSelector);
        });

        naja.uiHandler.addEventListener('interaction', this.locateLoadingIndicator.bind(this));
        naja.addEventListener('start', this.showLoader.bind(this));
        naja.addEventListener('complete', this.hideLoader.bind(this));
    }

    locateLoadingIndicator({detail}) {
        let loadingIndicator = detail.element;
        while (loadingIndicator !== null && ! loadingIndicator.matches('[data-loading-indicator]')) {
            loadingIndicator = loadingIndicator.parentElement;
        }

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


## Registering extensions

The one last step you need to take is to register the extension somewhere before calling `naja.initialize()`. You can
provide as many arguments as you like, all of them are passed to the extension's constructor.

```js
naja.registerExtension(LoadingIndicatorExtension, '#globalLoadingIndicator');
```

**Be sure to pass the extension's constructor, not an instantiated object!** This is because Naja instantiates the
extension in its `initialize()` method after its core components are loaded.
