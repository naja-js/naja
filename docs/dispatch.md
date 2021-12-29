# Dispatching requests

You can dispatch an AJAX request manually by calling Naja's `makeRequest()` method. It takes the following arguments:

```js
naja.makeRequest(method, url, data = null, options = {})
```

- `method: string` is the request method, usually `GET` or `POST`. It is case-insensitive.
- `url: string | URL` is the target URL.
- `data: any | null` can be array, object, string, `ArrayBuffer`, `Blob`, `FormData`, &hellip;
- `options: object | null` can be used to alter the behavior of some components or [extensions](extensibility.md).


## Configuring the request

On top of the configuration of various Naja's components and extensions, the `options` object can hold the configuration for the underlying Fetch API call:

```js
naja.makeRequest('GET', '/default', null, {
	fetch: {
		credentials: 'include',
    },
});
```


## Sending data

### Plain object in request body / query string

You can pass a plain object or an array as data. Naja properly serializes the data into the query string in case of a `GET` request, or into the request body for other methods.

```js
naja.makeRequest('GET', '/default', {value: '42'});
```

PHP is able to deserialize such data into appropriate fields and structures:

```php
public function actionDefault(string $value)
{
	var_dump($value); // --> string("42")
}
```

### Form

You can easily submit a form through Naja by serializing it into the `FormData` instance:

```js
naja.makeRequest('POST', '/form', new FormData(form));
```

### File upload

The same mechanism can be used to asynchronously upload files to the server:

```js
const formData = new FormData();
formData.append('file', file);

naja.makeRequest('POST', '/form', formData);
```

### JSON

You can send data in JSON. In this case, you need to specify the content type explicitly since it cannot be reliably inferred:

```js
naja.makeRequest('POST', '/json', JSON.stringify({value: '42'}), {
	fetch: {
		headers: {
			'Content-Type': 'application/json',
		},
	},
});
```

Also, a JSON payload needs to be manually read and parsed from the request body server-side:

```php
public function actionDefault()
{
	$body = json_decode(
		$this->getHttpRequest()->getRawBody(),
		true,
		flags: JSON_THROW_ON_ERROR,
	);
}
```


## Handling the response

The `makeRequest` method returns a Promise which either resolves to an object containing the parsed response payload, or is rejected with the thrown error:

```js
naja.makeRequest(method, url)
	.then((payload) => { /* process payload */ })
	.catch((error) => { /* handle error */ });
```

Under the hood, Naja uses Fetch API, which only rejects the promise in case of a network error or a similar condition, not when the response yields a non-200 HTTP code. Naja alters this behaviour and rejects the promise with an `HttpError` in such case, which also exposes the `Response` for further inspection:

```js
naja.makeRequest(method, url)
    .catch((error) => {
        if ('name' in error && error.name === 'HttpError' && error.response.status === 401) {
            // ...
        }
    });
```


## Request lifecycle events

Naja and some of its components dispatch various events during the lifecycle of the request and its processing. These allow for a great degree of extensibility; you can learn more about the dispatched events in the [Events reference](events.md#request-lifecycle)
