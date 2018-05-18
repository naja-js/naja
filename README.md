# ![Naja.js](doc/naja_type.png)

[![Build Status](https://img.shields.io/travis/jiripudil/Naja.svg)](https://travis-ci.org/jiripudil/Naja)
[![Code Coverage](https://img.shields.io/codecov/c/github/jiripudil/Naja.svg)](https://codecov.io/gh/jiripudil/Naja)
[![npm version](https://img.shields.io/npm/v/naja.svg)](https://npmjs.com/package/naja)
[![npm monthly downloads](https://img.shields.io/npm/dm/naja.svg)](https://npmjs.com/package/naja)
[![npm downloads](https://img.shields.io/npm/dt/naja.svg)](https://npmjs.com/package/naja)

> **Naja.** a genus of venomous elapid snakes comprising the true cobras. (Also, German for "Well" at the beginning of a sentence.)

Naja is a full-featured JS client-side AJAX library for Nette Framework.

It is written using modern-day JavaScript, but compiled into ES5 build that comes bundled with a few polyfills and thus should work on all modern browsers including IE 10 and above.

[![Sauce Test Status](https://saucelabs.com/browser-matrix/jiripudil.svg)](https://saucelabs.com/u/jiripudil)

iOS builds might be grey, but please don't panic, iOS is fully supported. This is just Saucelabs not being able to setup the test environment for iOS within a generous limit of 2 minutes, causing the jobs to time out occasionally.


## Installation

```bash
npm install naja
```

Naja comes in the form of an npm package. You can install and `import` it into your code at will.

If you're not friends with npm, you can download the archive from Github and load the bundled script from `dist` directory into your site.

If you like to learn by example, [@f3l1x](https://github.com/f3l1x) has created [a demo](https://github.com/trainit/2018-03-nette-webpack) which shows how to use Naja in a Nette Framework application with Webpack.


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
- `options: ?Object` can be used to alter the behavior of some components or extensions (see below). On top of that, it carries the options for the underlying AJAX library, [`qwest`](https://github.com/pyrsmk/qwest). Please refer to its docs for reference.

The `makeRequest` method returns a Promise which either resolves to the `response` object containing the parsed response body, or is rejected with the thrown `error`.

#### Default options

You can also provide default options for your extensions or Naja's core components:

```js
naja.defaultOptions = {
	history: false,
	myCustomOption: 42
};
```


### Core components

You don't need to dispatch most of the requests manually though. Naja does lots of things automatically through the system of its core components and extensions:


#### UIHandler

`UIHandler` binds Naja's AJAX handler to all links, forms and submit inputs marked with `ajax` class.

##### Custom selector

You can customize the bound selector easily, changing it to a data attribute, inverting it, or even disabling it entirely (see below for further notes):

```js
naja.uiHandler.selector = '[data-naja]';
// or
naja.uiHandler.selector = ':not(.synchronous)';
// or
naja.uiHandler.selector = '';
```


##### Allowed origins

Note that if you change the selector to an opt-out (`:not(.synchronous)`, empty string, etc.), *all* links will become asynchronous. Naja prevents you from shooting yourself in the foot and does not dispatch AJAX requests for external URLs unless you explicitly allow them:

```js
naja.uiHandler.allowedOrigins.push('https://allowed.origin.com:4000');
```

The current origin is allowed by default, i.e. it does not matter whether the `href` in the link points to a relative path or an absolute one.


##### Manual dispatch

Since version 1.4.0, `UIHandler` exposes two helper methods for dispatching UI-bound requests manually. This is especially useful if you need to submit a form programmatically, because `form.submit()` does not trigger the form's `submit` event.

```js
naja.uiHandler.clickElement(element);
naja.uiHandler.submitForm(form);
```

Neither `element` nor `form` have to be bound to Naja via the configured selector. However, the aforementioned allowed origin rules still apply, and the `interaction` event (see below) is triggered with `originalEvent` set to undefined.


#### RedirectHandler

`RedirectHandler` performs a redirection if there is `redirect` key in the response payload.

Note that if the target URL is local (same hostname), the redirect is actually done via another AJAX request. To prevent this and make a proper HTTP redirect, you can add `forceRedirect: true` to the payload.


#### SnippetHandler

`SnippetHandler` redraws snippets that come in the response payload's `snippets` key. You can mark the snippet with `data-naja-snippet-prepend` or `data-naja-snippet-append` attribute to prepend or append the snippet content, respectively, instead of replacing it. (`data-ajax-prepend` and `data-ajax-append` are supported as well.)

##### Snippet update events

While Naja exposes various events in the request's lifecycle to provide a flexible way of extending its behavior (see below), sometimes a more granular approach is handy. You can therefore attach event listeners to two SnippetHandler's events: `beforeUpdate` and `afterUpdate`. Both are dispatched for each updated snippet: the former is dispatched right before the snippet's content is updated, the latter after that. Both give you access to the HTML element in `event.snippet` and the content from payload in `event.content`.

You can use them like this:

```js
naja.snippetHandler.addEventListener('afterUpdate', (event) => {
	if (event.snippet.id === 'snippet--alert') {
		window.alert(event.content);
	}
});
```

The `beforeUpdate` event listener might also prevent the snippet from updating by calling `event.preventDefault()`. In such case, the `afterUpdate` event is not dispatched for that snippet.


#### FormsHandler

`FormsHandler` integrates Naja with `nette-forms` script if it is loaded. It initializes forms added to the page via snippets and prevents their submission if they fail to validate.

##### Custom nette-forms

By default, the nette-forms object is expected to reside in the global namespace: `window.Nette`. If you use ES modules and import nette-forms into a different variable, you should configure the correct reference manually:

```js
import netteForms from 'nette-forms';
naja.formsHandler.netteForms = netteForms;
```

This option is available since version 1.5.0.


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

##### UI cache

HistoryHandler caches the UI state (content of all snippets) in the history entry's state and reapplies it when navigating through the history. (And does so cleverly, so that `-prepend` and `-append` snippets do not break.)

You might, however, want to disable the cache for specific snippets (e.g. the shopping cart) so that their content is not reverted when the user navigates through the history. This can be done by adding the `data-naja-history-nocache` attribute to the snippet element.

##### Replace instead of push

If you want to replace the current state instead of pushing a new one, which makes sense for certain types of signals, you can add `history: 'replace'` to the options object (see above) when calling `makeRequest` manually, or add `data-naja-history="replace"` attribute to the `.ajax` element.

##### Disabling history

Similarly, you can keep a request off-the-record and not alter the browser's history at all by adding `history: false` to the options or `data-naja-history="off"` attribute to the element.


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
    - `originalEvent: ?Event`, the original UI event, or undefined if the request was dispatched via `UIHandler.clickElement()` or `UIHandler.submitForm()` (see above),
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
- **abort:** This event is dispatched if the request is aborted. Aborting the request does not trigger error handling because it is not an error per se, but it might be useful to react to it. This event has the following properites:
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
- **complete:** This event is dispatched when the request finishes, regardless of whether it succeeded or failed. It has the following properties:
    - `error: ?Error`, an object describing the error, if one occurred,
    - `xhr: XMLHttpRequest`, the XHR object,
    - `response: ?Object`, if provided,
    - `options: Object`.


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
