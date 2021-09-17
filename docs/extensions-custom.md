# Writing extensions

## Implementing the extension

Naja requires extensions to implement the `initialize` method which accepts an instance of `Naja`. This method is where you should bind your event listeners. The rest of the implementation is entirely up to you.

For reference, this is an example implementation of an extension that shows and hides a loading indicator as the request is sent and completed. The loading indicator is displayed in the closest possible location to the originating element, determined by the presence of a custom data attribute.

```js
class LoadingIndicatorExtension {
    constructor(defaultLoadingIndicatorSelector) {
        this.defaultLoadingIndicatorSelector = defaultLoadingIndicatorSelector;
    }

    initialize(naja) {
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => {
				this.defaultLoadingIndicator = document.querySelector(this.defaultLoadingIndicatorSelector);
			});
		} else {
			this.defaultLoadingIndicator = document.querySelector(this.defaultLoadingIndicatorSelector);
        }

        naja.uiHandler.addEventListener('interaction', this.locateLoadingIndicator.bind(this));
        naja.addEventListener('start', this.showLoader.bind(this));
        naja.addEventListener('complete', this.hideLoader.bind(this));
    }

    locateLoadingIndicator(event) {
        const loadingIndicator = event.detail.element.closest('[data-loading-indicator]');
        event.detail.options.loadingIndicator = loadingIndicator || this.defaultLoadingIndicator;
    }

    showLoader(event) {
        event.detail.options.loadingIndicator?.classList.add('is-loading');
    }

    hideLoader(event) {
        event.detail.options.loadingIndicator?.classList.remove('is-loading');
    }
}
```

### The code, explained

Let's go through the code piece by piece:

```js
class LoadingIndicatorExtension {
	constructor(defaultLoadingIndicatorSelector) {
		this.defaultLoadingIndicatorSelector = defaultLoadingIndicatorSelector;
	}

	// ...
}
```

The extension's constructor accepts a parameter. This lets you write extensions that can be reused, even multiple times on the same site, with each instance having a different argument.

```js
    initialize(naja) {
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => {
				this.defaultLoadingIndicator = document.querySelector(this.defaultLoadingIndicatorSelector);
			});
		} else {
			this.defaultLoadingIndicator = document.querySelector(this.defaultLoadingIndicatorSelector);
		}

		naja.uiHandler.addEventListener('interaction', this.locateLoadingIndicator.bind(this));
		naja.addEventListener('start', this.showLoader.bind(this));
		naja.addEventListener('complete', this.hideLoader.bind(this));
	}
```

As mentioned above, the `initialize()` method is the entrypoint of the extension. It receives the instance of `naja` and registers all event listeners upon it.

!> Note that depending on how you load and initialize Naja, the extension might be initialized before the DOM is loaded. You should always make sure that the DOM is loaded before you access it, especially when writing an extension for other developers to use.

```js
	locateLoadingIndicator(event) {
		const loadingIndicator = event.detail.element.closest('[data-loading-indicator]');
		event.detail.options.loadingIndicator = loadingIndicator || this.defaultLoadingIndicator;
	}
```

The [`interaction` event](events.md#interaction) listener tries to look up the closest ancestor of the clicked element that matches the given selector, and then sets it to `options`. The `options` object is mutable and is preserved throughout the whole request lifecycle, so that further listeners can later read and use its values.

```js
	showLoader(event) {
		event.detail.options.loadingIndicator?.classList.add('is-loading');
	}

	hideLoader(event) {
		event.detail.options.loadingIndicator?.classList.remove('is-loading');
	}
```

As indicated above, the last two methods listen for the `start` and `complete` events and make use of the `options` value previously set in the `locateLoadingIndicator()` listener.

---

Note that the extension doesn't have to be a class. Even a plain object works just fine as long as it implements the `initialize()` method:

```js
const ErrorTrackerExtension = {
	initialize(naja) {
		naja.addEventListener('error', (event) => {
			third.party.errorTracker.sendError(event.detail.error);
		});
	}
};
```


## Registering extensions

The one last step you need to take is to register the extension:

```js
naja.registerExtension(new LoadingIndicatorExtension('#globalLoadingIndicator'));
```

This is best done before calling `naja.initialize()`, but it's not strictly necessary.
