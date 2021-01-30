# Events reference

Naja and some of its components implement the `EventTarget` interface. This means that you can hook onto the lifecycle
events via the `addEventListener()` method. All dispatched events are `CustomEvent`s and their `detail` attribute holds
event-specific data.


## Naja

### init

This event is dispatched when `naja.initialize()` is called. It can be used to initialize all the necessities of
an extension. If you've followed the instructions, the DOM is already loaded by the time this event is dispatched,
so that you can access DOM elements in the listener. The `init` event's `detail` has the following properties:

- `defaultOptions: Object`, an object holding the default options passed to `naja.initialize()` method.

### before

This event is dispatched when the `Request` is created but not yet sent. At this point, you can call the event's
`preventDefault()` method to cancel the request. The event's `detail` holds the following properties:

- `request: Request`, the Fetch API request object,
- `method: string`, the requested HTTP method,
- `url: string`, the requested URL,
- `data: any`, the data to be sent along with the request,
- `options: Object`.

### start

This event is dispatched right after the request is sent. Its `detail` holds the following properties:

- `request: Request`, the Fetch API request object,
- `promise: Promise`, the original Promise returned by `fetch()`,
- `abortController: AbortController`, an `AbortController` instance for current request,
- `options: Object`.

### abort

This event is dispatched if the request is aborted. Aborting the request does not trigger error handling because
it is not an error per se, but it might be useful to react to it. This event's `detail` has the following properties:
    
- `request: Request`, the aborted request object,
- `error: AbortError`, the abort error instance,
- `options: Object`.

### success

This event is dispatched when the request successfully finishes. Its `detail` has the following properties:

- `request: Request`, the request object,
- `response: Response`, the returned response object,
- `payload: Object`, the parsed response payload,
- `options: Object`.

### error

This event is dispatched when the request finishes with errors. Its `detail` has the following properties:

- `request: Request`, the request object,
- `response: ?Response`, the response object if there is any,
- `error: Error`, an object describing the error,
- `options: Object`.

### complete

This event is dispatched when the request finishes, regardless of whether it succeeded or failed. Its `detail` has
the following properties:

- `request: Request`, the request object,
- `response: ?Response`, the response object if there is any,
- `payload: ?Object`, the parsed response payload if the request succeeded,
- `error: ?Error`, an object describing the error if the request failed,
- `options: Object`.


## UIHandler

### interaction

This event is dispatched when the user interacts with a DOM element that has the Naja's listener bound to it, or when
using manual dispatch (see more in [UI binding](ui-binding.md)). This event's `preventDefault()` method can be used
to prevent the request from being dispatched. This event's `detail` has the following properties:

- `element: HTMLElement`, the element the user interacted with,
- `originalEvent: ?Event`, the original UI event, or `undefined` if the interaction was triggered [by hand](ui-binding.md),
- `options: Object`, an empty object that can be populated with options based on the element's attributes.


## SnippetHandler

### beforeUpdate

This event is dispatched *before* updating the contents of each and every snippet. You can prevent the snippet from
updating by calling the event's `preventDefault()` method.

The event's `detail` has the following properties:

- `snippet: Element`, the snippet element,
- `content: string`, the new content from response payload,
- `fromCache: boolean`, a flag telling whether the snippet is being updated from cache after user navigation through
    history, or as a result of a request to the server,
- `operation: (snippet: Element, content: string) => void`, the operation that is going to be done with the snippet
    and its new content,
- `changeOperation: (operation: (snippet: Element, content: string) => void) => void`, a method that can be called
    to override the snippet update `operation`,
- `options: Object`.

### afterUpdate

This event is dispatched *after* updating the contents of each and every snippet. If the snippet update has been
prevented by canceling the `beforeUpdate` event, this event is not dispatched for given snippet.

The event's `detail` has the following properties:

- `snippet: Element`, the snippet element,
- `content: string`, the new content from response payload,
- `fromCache: boolean`, a flag telling whether the snippet is being updated from cache after user navigation through
    history, or as a result of a request to the server,
- `operation: (snippet: Element, content: string) => void`, the operation that has been done with the snippet and
    its new content, 
- `options: Object`.


## RedirectHandler

### redirect

This event is dispatched before a redirect is made. The event's `preventDefault()` method can be used to prevent
the redirection from happening. You can also see and alter whether the redirect is going to be made by issuing
another asynchronous request through Naja, or the hard way via the browser.

The `redirect` event's `detail` has the following properties:

- `url: string`, the target URL,
- `isHardRedirect: boolean`, a flag telling whether the redirect is going to be a hard one,
- `setHardRedirect: (value: boolean) => void`, a method which can be called to override the hard redirect flag,
- `options: Object`.
