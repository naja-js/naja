# Default extensions

Naja comes pre-packaged with two handy extensions (those are registered by default) and provides an API for you to
implement [your own extensions](extensions-custom.md) with ease.


## AbortExtension

This extension allows the user to cancel the pending request by pressing <kbd>Esc</kbd>. You can disable this behavior
for a single request by passing `abort: false` in the options object (see above) when calling `makeRequest` manually,
or by adding `data-naja-abort="off"` attribute to the `.ajax` element.


## UniqueExtension

This extension disallows multiple requests to run concurrently. When you dispatch a new request, the old one is aborted.
Again, you can disable this by passing `unique: false` in the options or adding the `data-naja-unique="off"` attribute.
