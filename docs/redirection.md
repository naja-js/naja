# Redirection

`RedirectHandler` performs a redirection if there is `redirect` key in the response payload.

Note that if the target URL is local (same origin), the redirect is actually done via another AJAX request. To prevent
this and make a proper HTTP redirect, you can add `forceRedirect: true` to the response payload or to the request's
options.

?> The `forceRedirect` as a request option is supported since version 1.3.0.
