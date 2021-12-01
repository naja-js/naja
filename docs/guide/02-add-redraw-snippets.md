# Add and redraw snippets

?> If you want to follow along with this step of the tutorial **and don't have the code from the previous step,** checkout a new branch off the `step-2` tag: `git checkout -B follow-along step-2`

By default, Naja attaches its handlers onto elements marked with the `ajax` class, so we need to go through the server-side code and add the class to all links and forms in the application. This can be tedious, but opting into the AJAX behaviour gives you the most control over which actions are asynchronous in your application and which are not.

Let's add the `ajax` class to:

- the link and form in the `AddToBasketButtonControl.latte` template;
- the basket link in the `BasketWidgetControl.latte` template;
- the form in the `CategoryFilterControl.latte` template;
- the page links in the `PagingControl.latte` template;
- the logo link in the `Presenters/@layout.latte` template; and
- the product detail link in the `Presenters/Basket.latte`, `Presenters/ProductDetail.latte` and `Presenters/ProductList.latte` templates.

If you reload the page now and open the Network tab of your browser's development tools, you should notice that when you click any of the marked links, Naja dispatches an asynchronous `Fetch` request.

Apart from the network request, however, nothing else happens on the page when you click the link. We still need to add some more logic to the server-side code.

?> You can learn more about how Naja binds to UI elements in [UI binding](/ui-binding.md).

## Snippets

The [Nette Framework's implementation of AJAX](https://doc.nette.org/en/ajax) is based on the idea of snippets: you mark specific areas of the page and when an AJAX request runs, the server evaluates and returns only the contents of the snippets instead of the whole page. We need to mark our snippets and instruct the framework to redraw them when an AJAX request comes.

Since this e-commerce site is pretty simple, we can take the rough and easy approach: wrap the whole content in a snippet. Open the `@layout.latte` template file and add the `n:snippet` macro to the `<main>` element. Let's call the snippet "content":

```diff
- <main class="mainContent">
+ <main class="mainContent" n:snippet="content">
      {include content}
  </main>
```

We'll also wrap the document's `<title>` with a snippet called "title" so that the title is automatically updated during AJAX navigation:

```diff
- <title>{include title} &ndash; CodinCoffee</title>
+ <title n:snippet="title">{include title} &ndash; CodinCoffee</title>
```

The last UI component we need to wrap because it's included on every page is the BasketWidget. Go to the `BasketWidget.latte` template and add the `n:snippet` macro to the wrapping `<div>`. This time it's unique within the scope of the component, so it doesn't need a name:

```diff
- <div class="basketWidget">
+ <div class="basketWidget" n:snippet>
```

We want these snippets to be redrawn on every request, so let's add a `beforeRender()` method to the `BasePresenter` and schedule the snippets for update there:

```php
public function beforeRender(): void
{
    parent::beforeRender();
    $this->redrawControl('title'); 
    $this->redrawControl('content');
    $this['basketWidget']->redrawControl();
}
```

With all these changes, the basic interactions on the website should now be handled asynchronously by Naja: when you click a link, Naja sends a background request and redraws the contents of the page. It also stores the snippets into History API entry so that when you press the browser's Back button, the page changes back instantly and without a roundtrip to the server.

?> You can learn more about Naja's handling of snippets in [Snippets](/snippets.md).

This comes with its own caveats, though. We'll take a look at them and find a way to solve them in the next chapter.
