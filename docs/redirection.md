# Redirection

`RedirectHandler` performs a redirection if there is `redirect` key in the response payload.

Note that if the target URL is local (same origin), the redirect is actually done via another AJAX request. To prevent
this and make a proper HTTP redirect, you can add `forceRedirect: true` to the request options or
add `data-naja-force-redirect` attribute to the `.ajax` element.

?> The `forceRedirect` as a request option is supported since version 1.3.0.

?> The `data-naja-force-redirect` attribute is supported since version 1.7.0.

!> Reading `forceRedirect` from response payload is deprecated since version 1.7.0 and will be removed in 2.0.
