# Fix the basket

?> If you want to follow along with this step of the tutorial **and don't have the code from the previous step,** checkout a new branch off the `step-3` tag: `git checkout -B follow-along step-3`

We have made the whole application asynchronous but if you've clicked around, you might've noticed there are some rough edges.

## Adding products to basket

### Remove the redirection

For example, if you add a product to basket, or change its amount in basket, you can see in the developer's tools that Naja dispatches two requests: the first one returns a redirection. Naja follows the redirect and it is only the second request that actually returns snippets to redraw.

We need to remove the redirection and let the `redrawControl` code that's already in place handle it. Open the `ProductDetailPresenter.php` and remove the redirection from the `createComponentAddToBasket()` method.

```diff
- $component->onChange[] = fn() => $this->redirect('this');
```

Then do the same change in `BasketPresenter.php`.

?> You can learn more about how Naja follows redirects in [Redirection](/redirection.md).

### Hint Naja about the target URL

Without the redirect, when you add a new product to the basket, the History API integration replaces the URL of the page. But because adding to basket is implemented via a signal, this exposes the `_do` parameter in the URL which could lead to the request being replayed if the user refreshes the page.

Without AJAX, this is traditionally solved by redirection – which we removed just a minute ago. Luckily, Naja provides a mechanism for this. If you add a `postGet: true` to the response payload along with the desired `url`, Naja will use that provided URL for the history entry instead of the actual request URL.

Open both `ProductDetailPresenter.php` and `BasketPresenter.php` again and add the following piece of code in place of the original redirection:

```diff
+ $component->onChange[] = function () {
+     $this->payload->postGet = true;
+     $this->payload->url = $this->link('this');
+ };
```

### Replace the history entry

When you add something to the basket and then navigate back in the browser, the page is redrawn from the history entry and its associated snippets cache, reverting the user's action. The item is still in the basket, though, which means the UI is out-of-sync. Since the widget basically only changes state that is local to the page, we can easily replace the current history entry instead of pushing a new one.

Open the `AddToBasketButtonControl.latte` template and add the `data-naja-history="replace"` data-attribute to both the button and the form:

```diff
-        <a n:href="add!" class="addToBasket-button ajax">
+        <a n:href="add!" class="addToBasket-button ajax" data-naja-history="replace">
```

```diff
-        <form n:name="form" class="ajax">
+        <form n:name="form" class="ajax" data-naja-history="replace">
```

Now when you click on a product on the product list, add a few pieces of it to the basket and then press Back in the browser, you should get right back to the product list. One thing is still off, though.

?> You can learn more about Naja's integration into the History API in [History](/history.md).

## Preserve the basket widget

You've added a product to the basket and the basket widget shows "1" item in the basket. But when you go back, it reverts to zero, even though the items are kept in the basket. To prevent the widget from displaying stale data from cache, we should exclude it from the cache altogether so that it always stays up-to-date.

Open the `BasketWidgetComponent.latte` and mark the snippet with the `data-naja-snippet-cache="off"` data-attribute:

```diff
- <div class="basketWidget" n:snippet>
+ <div class="basketWidget" n:snippet data-naja-snippet-cache="off">
```

Now the basket widget should properly update when you modify the basket contents, and preserve the latest state when navigating through the website and browser's history.

?> You can learn more about the snippet caching mechanism in [Snippet cache](/snippet-cache.md).

With the basket solved, next we'll take a look at the third-party reviews widget on the product detail page.
