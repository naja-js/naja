# UI binding

`UIHandler` binds Naja's AJAX handler to all links, forms and submit inputs marked with `ajax` class.


## Custom selector

You can customize the bound selector easily, changing it to a data attribute, inverting it, or even disabling it
entirely (see below for further notes):

```js
naja.uiHandler.selector = '[data-naja]';
// or
naja.uiHandler.selector = ':not(.synchronous)';
// or
naja.uiHandler.selector = '';
```


## Allowed origins

Note that if you change the selector to an opt-out (`:not(.synchronous)`, empty string, etc.), *all* links will become
asynchronous. Naja prevents you from shooting yourself in the foot and does not dispatch AJAX requests for external URLs
unless you explicitly allow them:

```js
naja.uiHandler.allowedOrigins.push('https://allowed.origin.com:4000');
```

The current origin is allowed by default, i.e. it does not matter whether the `href` in the link points to a relative
path or an absolute one.

?> The custom selector feature and allowed origins check are available since version 1.1.0.


## Manual dispatch

`UIHandler` exposes two helper methods for dispatching UI-bound requests manually. This is especially useful if you need
to submit a form programmatically, because `form.submit()` does not trigger the form's `submit` event.

```js
naja.uiHandler.clickElement(element);
naja.uiHandler.submitForm(form);
```

Neither `element` nor `form` have to be bound to Naja via the configured selector. However, the aforementioned allowed
origin rules still apply, and the `interaction` event (see [Writing extensions](extensions-custom.md)) is triggered
with `originalEvent` set to undefined.

?> The manual dispatch methods are available since version 1.4.0.


## Manual bind

You can also manually bind the AJAX handler to DOM nodes that are created dynamically via a different mechanism than
Nette snippets:

```js
naja.uiHandler.bindUI(element);
```

The method searches the given `element` and its children for elements that match the configured selector and attaches
the AJAX handler to them.

?> The manual bind method is available since version 1.6.0.
