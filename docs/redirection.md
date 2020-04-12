# Redirection

`RedirectHandler` performs a redirection if there is `redirect` key in the response payload.

Note that if the target URL points to one of the [allowed origins](ui-binding.md#allowed-origins), the redirect is
actually done via another AJAX request. To prevent this and make a proper HTTP redirect, you can add `forceRedirect: true`
to the request options or add `data-naja-force-redirect` attribute to the `.ajax` element.

?> The `forceRedirect` as a request option is supported since version 1.3.0.

?> The `data-naja-force-redirect` attribute is supported since version 1.7.0.

!> Reading `forceRedirect` from response payload is deprecated since version 1.7.0 and will be removed in 2.0.

?> The check against allowed origin is done since version 1.8.0. Previously, RedirectHandler only redirected via another
AJAX request if the target URL was local (i.e. with the same origin).


## Redirect event

Prior to redirecting, RedirectHandler dispatches the `redirect` event. The event gives you access to the target URL
in `event.url`, and to the information whether the redirect is going to be an asynchronous one, or a hard one
(`event.isHardRedirect`).

You can alter that behaviour by calling `event.setHardRedirect(value)` with a boolean `value`. The event listener
can also entirely prevent the redirection by calling `event.preventDefault()`.

?> The redirect event is available since version 1.8.0.
