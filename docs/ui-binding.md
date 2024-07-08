# UI binding

As soon as Naja is initialized, it attaches its handler to all links, forms and submit inputs that match a configured selector. By default, the selector is `.ajax`, i.e. all you have to do is to add the `ajax` class to your links and forms that you want to be handled asynchronously:

```html
<a n:href="refresh!" class="ajax">Refresh</a>

<form n:name="form" class="ajax">
    <input n:name="submit">
</form>

<form n:name="otherForm">
    <input n:name="submit" class="ajax">
</form>
```


## Custom selector

You can easily customize the bound selector, e.g. change it to a data attribute, invert the behaviour, or even provide an empty selector to attach AJAX behaviour to *all* links and forms. Note that this must be configured *before* calling `naja.initialize()`:

```js
naja.uiHandler.selector = '[data-naja]';
// or
naja.uiHandler.selector = ':not(.synchronous)';
// or
naja.uiHandler.selector = '';
```

### Allowed origins

If you change the selector to an opt-out (`:not(.synchronous)`, empty string, etc.), *all* links will become asynchronous. Naja prevents you from shooting yourself in the foot with cross-origin AJAX requests and does not handle external URLs unless you explicitly allow them:

```js
naja.uiHandler.allowedOrigins.push('https://allowed.origin.com:4000');
```

The current origin is allowed by default, i.e. it does not matter whether the `href` of the link points to a relative URL or an absolute one.


## Manual bind

You can manually bind Naja's handler to DOM elements that are created dynamically via a different mechanism than snippets:

```js
const element = document.createElement('a');
element.href = '/link-target';
element.classList.add('ajax');
document.body.appendChild(element);

naja.uiHandler.bindUI(element);
```

The `bindUI` method searches the given `element` and its children for elements that match the configured selector and attaches Naja's handler to them.


## Manual dispatch

Naja exposes two helper methods for dispatching UI-bound requests manually, `clickElement(link)` and `submitForm(formOrSubmitter)`. The target element **does not** have to be bound to Naja via the configured selector. However, the aforementioned [allowed origin rules](#allowed-origins) still apply.

Both of these methods optionally accept the `options` object that you can use to configure the request:

```js
naja.uiHandler.clickElement(link, { history: false });
```

Both of them return the promise from the [underlying call to `naja.makeRequest()`](dispatch.md#handling-the-response):

```js
naja.uiHandler.clickElement(link)
	.then((payload) => { /* process payload */ });
```

### Manual form submission

The `submitForm()` method has been especially useful if you needed to submit a form programmatically — such as when a value of an input changes — because `form.submit()` does not trigger the form's `submit` event which Naja relies on.

However, in modern browsers, you can use the native `form.requestSubmit()` to trigger the form submission in a way that Naja can notice and process:

```js
selectBox.addEventListener('change', (event) => {
	event.target.form.requestSubmit();
});
```

### Manual interaction with a non-supported element

For all non-standard use cases, there is a `processInteraction()` helper method that allows you to hook Naja onto any custom interaction, and have it dispatch the `interaction` event properly:

```js
customButton.addEventListener('click', (event) => {
	naja.uiHandler.processInteraction(
		customButton, // interaction target
		'GET', // method
		customButton.dataset.targetUrl, // url
		null, // data
		{history: false}, // options
		event, // original UI event
	);
});
```

?> The `processInteraction()` helper is available since version 3.1.0.


## Interaction event

Whenever the user clicks a Naja-bound element, the `interaction` event is dispatched. It contains the clicked element, the original UI event (unless the interaction was triggered manually), and the current request's `options` object that you can modify. You can also call the event's `preventDefault()` to prevent the request from being dispatched:

```js
naja.uiHandler.addEventListener('interaction', (event) => {
	if (event.detail.element.hasAttribute('data-confirm')
        && ! window.confirm(event.detail.element.getAttribute('data-confirm'))
    ) {
		event.preventDefault();
	}
});
```

This event is particularly useful for configuring the behaviour of extensions based on the DOM elements and their attributes:

```js
naja.uiHandler.addEventListener('interaction', (event) => {
	if (event.detail.element.hasAttribute('data-spinner-target')) {
		const spinnerSelector = event.detail.element.getAttribute('data-spinner-target');
		event.detail.options.spinner = document.querySelector(spinnerSelector);
	}
});
```
