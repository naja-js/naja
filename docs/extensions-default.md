# Default extensions

Naja comes bundled with two handy extensions that are registered by default:

?> You can also easily extend Naja's capabilities by [writing your own extensions](extensions-custom.md).


## AbortExtension

This extension allows the user to cancel the pending request by pressing <kbd>Esc</kbd>. You can disable this behavior for a single request by passing `abort: false` in the options object when calling `makeRequest` manually, or by adding `data-naja-abort="off"` attribute to the `.ajax` element:

```js
naja.makeRequest('GET', '/refresh', null, { abort: false });
```

```html
<a n:href="refresh!" class="ajax" data-naja-abort="off">Link</a>
```


## UniqueExtension

This extension disallows multiple requests to run concurrently. When you dispatch a new request, the old one is aborted. Again, you can disable this by passing `unique: false` in the options or adding the `data-naja-unique="off"` attribute:

```js
naja.makeRequest('GET', '/refresh', null, { unique: false });
```

```html
<a n:href="refresh!" class="ajax" data-naja-unique="off">Link</a>
```

You can also provide a custom string key via the `unique` option or `data-naja-unique` attribute to create a new unique group. Only requests from the same group are aborted when a new one is started:

```js
naja.makeRequest('GET', '/action', null, { unique: 'refresh' });
```

```html
<a n:href="refresh!" class="ajax" data-naja-unique="refresh">Link</a>
```
