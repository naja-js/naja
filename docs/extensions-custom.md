# Custom extensions

The true power of Naja is in how easy you can implement your own extensions to integrate your web application with the
flow of the AJAX requests. You already know how to do it, since `Naja` class implements the same `EventTarget` interface
as many DOM elements do.


## Events reference

Specifically, it dispatches the following events:

- **init:** This event is dispatched when `naja.initialize()` is called. It can be used to initialize all the necessities
    of the extension. If you've followed the instructions, the DOM is already loaded by the time this event is dispatched,
    so that you can access DOM elements in the listener. The `init` event has the following properties:
    - `defaultOptions: Object`, an object holding the default options passed to `naja.initialize()` method.

- **load:** This event is dispatched after `init` and then after every request, be it successful or not. It can be used
    to reload things, re-add event listeners, etc. It has no properties.

- **interaction:** This event is dispatched when the user interacts with a DOM element that has the Naja's listener bound
    to it. It has the following properties:
    - `element: HTMLElement`, the element the user interacted with,
    - `originalEvent: ?Event`, the original UI event, or undefined if the request was dispatched [by hand](ui-binding.md),
    - `options: Object`, an empty object that can be populated with options based on the element's attributes.

- **before:** This event is dispatched when the `XMLHttpRequest` object is created but not yet sent. The event has the
    following properties:
    - `xhr: XMLHttpRequest`, the XHR object,
    - `method: string`, the requested HTTP method,
    - `url: string`, the requested URL,
    - `data: mixed`, the data to be sent along with the request,
    - `options: Object`.

- **start:** This event is dispatched right after the request is sent. It has the following properties:
    - `request: Promise`, a Promise that resolves or rejects when the request is completed,
    - `xhr: XMLHttpRequest`, the XHR object.

- **abort:** This event is dispatched if the request is aborted. Aborting the request does not trigger error handling
    because it is not an error per se, but it might be useful to react to it. This event has the following properties:
    - `xhr: XMLHttpRequest`, the aborted XHR object.

- **success:** This event is dispatched when the request successfully finishes. It has the following properties:
    - `xhr: XMLHttpRequest`, the XHR object,
    - `response: Object`, the parsed response payload,
    - `options: Object`.

- **error:** This event is dispatched when the request finishes with errors. It has the following properties:
    - `error: Error`, an object describing the error,
    - `xhr: XMLHttpRequest`, the XHR object,
    - `response: ?Object`, if provided,
    - `options: Object`.

- **complete:** This event is dispatched when the request finishes, regardless of whether it succeeded or failed. It has
    the following properties:
    - `error: ?Error`, an object describing the error, if one occurred,
    - `xhr: XMLHttpRequest`, the XHR object,
    - `response: ?Object`, if provided,
    - `options: Object`.


## Extension implementation

The extension receives in its constructor the instance of `Naja` and also additional arguments if provided. The
constructor is where you should bind your event listeners. The rest of the implementation is entirely up to you.

For reference, this is an example implementation of an extension that shows and hides a loader element as the request
is sent and completed:

```js
class LoaderExtension {
    constructor(naja, loaderSelector) {
        naja.addEventListener('init', () => {
            this.loader = document.querySelector(loaderSelector);
        });

        naja.addEventListener('start', this.showLoader.bind(this));
        naja.addEventListener('complete', this.hideLoader.bind(this));
    }

    showLoader() {
        this.loader.style.display = 'block';
    }

    hideLoader() {
        this.loader.style.display = 'none';
    }
}
```

Note that the example above uses ES6. If you don't have the means to compile it, you should be just fine with something
like this:

```js
function LoaderExtension(naja, loaderSelector) {
    naja.addEventListener('init', function () {
        this.loader = document.querySelector(loaderSelector);
    }.bind(this));

    naja.addEventListener('start', showLoader.bind(this));
    naja.addEventListener('complete', hideLoader.bind(this));

    function showLoader() {
        this.loader.style.display = 'block';
    }

    function hideLoader() {
        this.loader.style.display = 'none';
    }

    return this;
}
```


## Registering extensions

The one last step you need to take is to register the extension somewhere before calling `naja.initialize()`. You can
provide as many arguments as you like, all of them are passed to the extension's constructor.

```js
naja.registerExtension(LoaderExtension, '#loader');
```

**Be sure to pass the extension's constructor, not an instantiated object!** This is because Naja instantiates the
extension in its `initialize()` method after its core components are loaded.
