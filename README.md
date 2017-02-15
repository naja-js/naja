# ![Naja.js](doc/naja_type.png)

[![Build Status](https://img.shields.io/travis/jiripudil/Naja.js.svg)](https://travis.org/jiripudil/Naja.js)
[![npm version](https://img.shields.io/npm/v/naja.svg)](https://npmjs.com/package/naja)
[![npm monthly downloads](https://img.shields.io/npm/dm/naja.svg)](https://npmjs.com/package/naja)
[![npm downloads](https://img.shields.io/npm/dt/naja.svg)](https://npmjs.com/package/naja)

> **Naja.** a genus of venomous elapid snakes comprising the true cobras. (Also, German for "Well" at the beginning of a sentence.)

Naja is a full-featured JS client-side AJAX library for Nette Framework.

It is written using modern-day JavaScript, but compiled into ES5 build that comes bundled with a few polyfills and thus should work on all modern browsers including IE 10 and above (not tested, though).


## Installation

```bash
npm install naja
```

Naja comes in the form of an npm package. You can install and `import` it into your code at will.

If you're not friends with npm, you can download the archive from Github and load the bundled script from `dist` directory into your site.


## Usage

Once you load `naja`, you need to initialize it. You should make sure this happens after the DOM is loaded, e.g. like this:

```js
document.addEventListener('DOMContentLoaded', naja.initialize.bind(naja));
```

The `initialize()` method loads all Naja's core components plus all registered userland extensions (see below).


### Dispatching a request

You can dispatch an AJAX request by calling Naja's `makeRequest()` method. It takes the following arguments:

```js
naja.makeRequest(method, url, data = null, options = {})
```

- `method: string` is the request method, usually `GET` or `POST`. It is case-insensitive.
- `url: string` is the target URL.
- `data: ?mixed` can be pretty much anything: array, object, string, `ArrayBuffer`, `Blob`, `FormData`, &hellip;
- `options: ?Object` can be used to alter the behavior of some extensions (see below). On top of that, it carries the options for the underlying AJAX library, [`qwest`](https://github.com/pyrsmk/qwest). Please refer to its docs for reference.


### Core components

You don't need to dispatch most of the requests manually though. Naja does lots of things automatically through the system of its core components and extensions:


#### UIHandler

`UIHandler` binds Naja's AJAX handler to all links, forms and submit inputs marked with `ajax` class.

#### RedirectHandler

`RedirectHandler` performs a redirection if there is `redirect` key in the response payload.

Note that if the target URL is local (same hostname), the redirect is actually done via another AJAX request. To prevent this and make a proper HTTP redirect, you can add `forceRedirect: true` to the payload.

#### SnippetHandler

`SnippetHandler` redraws snippets that come in the response payload's `snippets` key. You can mark the snippet with `data-naja-snippet-prepend` or `data-naja-snippet-append` attribute to prepend or append the snippet content, respectively, instead of replacing it. (`data-ajax-prepend` and `data-ajax-append` are supported as well.)

#### FormsHandler

`FormsHandler` integrates Naja with `nette-forms` script if it is loaded. It initializes forms added to the page via snippets and prevents their submission if they fail to validate.

#### HistoryHandler

`HistoryHandler` synchronizes AJAX requests with the browser's History API. When a request finishes, HistoryHandler pushes the new state including the document's title, URL, and a snapshot of snippets content into the browser's history.

##### P/R/G considerations

Sometimes, in cases where you would employ the [Post/Redirect/Get](https://en.wikipedia.org/wiki/Post/Redirect/Get) scheme, this behavior can add unneeded things to the URL. To prevent this, you need to hint Naja on what the target URL should be by adding `postGet: true` and `url: <targetUrl>` to the response payload. Generally, where you would do this:

```php
if ($this->isAjax()) {
	$this->redrawControl('content');

} else {
	$this->redirect('this');
}
```

you should now do this instead:

```php
if ($this->isAjax()) {
	$this->redrawControl('content');
	$this->payload->postGet = TRUE;
	$this->payload->url = $this->link('this');

} else {
	$this->redirect('this');
}
```

Furthermore, if you want to replace the current state instead of pushing a new one, which makes sense for certain types of signals, also add `replaceHistory: true` to the response payload.

##### UI cache

HistoryHandler caches the UI state (content of all snippets) in the history entry's state and reapplies it when navigating through the history. (And does so cleverly, so that `-prepend` and `-append` snippets do not break.)

You might, however, want to disable the cache for specific snippets (e.g. the shopping cart) so that their content is not reverted when the user navigates through the history. This can be done by adding the `data-naja-history-nocache` attribute to the snippet element.

#### ScriptLoader

`ScriptLoader` executes scripts that are dynamically added to the page via snippets. If you have scripts in your snippets, be aware that they might be executed multiple times as the user navigates the site. In many cases, you can also implement the desired behavior using extensions (see below).


### Extensions

Naja comes pre-packaged with two handy extensions (those are registered by default) and provides an API for you to implement your own extensions with ease.

#### AbortExtension

This extension allows the user to cancel the pending request by pressing <kbd>Esc</kbd>. You can disable this behavior for a single request by passing `abort: false` in the options object (see above) when calling `makeRequest` manually, or by adding `data-naja-abort="off"` attribute to the `.ajax` element.

#### UniqueExtension

This extension disallows multiple requests to run concurrently. When you dispatch a new request, the old one is aborted. Again, you can disable this by passing `unique: false` in the options or adding the `data-naja-unique="off"` attribute.


### Custom extensions

The true power of Naja is in how easy you can implement your own extensions to integrate your web application with the flow of the AJAX requests. You already know how to do it, since `Naja` class implements the same `EventTarget` interface as many DOM elements do. Specifically, it dispatches the following events:

- **init:** This event is dispatched when `naja.initialize()` is called. It can be used to initialize all the necessities of the extension. If you've followed the instructions, the DOM is already loaded by the time this event is dispatched, so that you can access DOM elements in the listener. The `init` event has no properties.
- **load:** This event is dispatched after `init` and then after every request, be it successful or not. It can be used to reload things, re-add event listeners, etc. It has no properties.
- **interaction:** This event is dispatched when the user interacts with a DOM element that has the Naja's listener bound to it. It has the following properties:
    - `element: HTMLElement`, the element the user interacted with,
    - `originalEvent: Event`, the original UI event,
    - `options: Object`, an empty object that can be populated with options based on the element's attributes.
- **before:** This event is dispatched when the `XMLHttpRequest` object is created but not yet sent. At this point, you can call the event's `preventDefault()` method to cancel the request. The event has the following properties:
    - `xhr: XMLHttpRequest`, the XHR object,
    - `method: string`, the requested HTTP method,
    - `url: string`, the requested URL,
    - `data: mixed`, the data to be sent along with the request,
    - `options: Object`.
- **start:** This event is dispatched right after the request is sent. It has the following properties:
    - `request: Promise`, a Promise that resolves or rejects when the request is completed,
    - `xhr: XMLHttpRequest`, the XHR object.
- **success:** This event is dispatched when the request successfully finishes. It has the following properties:
    - `xhr: XMLHttpRequest`, the XHR object,
    - `response: Object`, the parsed response payload.
- **error:** This event is dispatched when the request finishes with errors. It has the following properties:
    - `error: Error`, an object describing the error,
    - `xhr: XMLHttpRequest`, the XHR object,
    - `response: ?Object`, if provided.
- **complete:** This event is dispatched when the request finishes, regardless of whether it succeeded or failed. It has the following properties:
    - `error: ?Error`, an object describing the error, if one occurred,
    - `xhr: XMLHttpRequest`, the XHR object,
    - `response: ?Object`, if provided.


#### Extension implementation

The extension receives in its constructor the instance of `Naja` and also additional arguments if provided. The constructor is where you should bind your event listeners. The rest of the implementation is entirely up to you.

For reference, this is an example implementation of an extension that shows and hides a loader element as the request is sent and completed:

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

Note that the example above uses ES6. If you don't have the means to compile it, you should be just fine with something like this:

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

The one last step you need to take is to register the extension somewhere before calling `naja.initialize()`. You can provide as many arguments as you like, all of them are passed to the extension's constructor.

```js
naja.registerExtension(LoaderExtension, '#loader');
```

**Be sure to pass the extension's constructor, not an instantiated object!** This is because Naja instantiates the extension in its `initialize()` method after its core components are loaded.
