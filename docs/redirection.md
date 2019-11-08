# Redirection

`RedirectHandler` performs a redirection if there is `redirect` key in the response payload.

Note that if the target URL points to one of the [allowed origins](ui-binding.md#allowed-origins), the redirect is
actually done via another AJAX request. To prevent this and make a proper HTTP redirect, you can add `forceRedirect: true`
to the request options or add `data-naja-force-redirect` attribute to the `.ajax` element.


## Redirect event

Prior to redirecting, RedirectHandler dispatches the `redirect` event. The event gives you access to the target URL
in `event.detail.url`, and to the information whether the redirect is going to be an asynchronous one, or a hard one
(`event.detail.isHardRedirect`).

You can alter that behaviour by calling `event.detail.setHardRedirect(value)` with a boolean `value`. The event listener
can also entirely prevent the redirection by calling `event.preventDefault()`.
