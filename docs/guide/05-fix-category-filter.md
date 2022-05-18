# Fix the category filter

?> If you want to follow along with this step of the tutorial **and don't have the code from the previous step,** checkout a new branch off the `step-5` tag: `git checkout -B follow-along step-5`

We've already resolved issues with the basket and the reviews widget. The last remaining broken piece is the category filter on the product list. If you click it, you notice that it dispatches a regular, synchronous request.

Take a look into the `categoryFilter.js` file. The relevant portion is this:

```js
selectBox.addEventListener('change', (event) => {
    event.target.form.submit();
});
```


## Submit the form via Naja

The problem is that the `HTMLFormElement.submit()` method does not trigger the `submit` event which Naja listens for. There is an alternative `requestSubmit()` method that solves this problem, but it's unfortunately not yet supported in all modern browsers (ahem, Safari, ahem). Luckily, Naja provides a helper method that makes it handle the form submission.

Start by importing Naja into the `categoryFilter.js` file. Add this to the top of the file:

```js
import naja from 'naja';
```

And then change the form submission method call from above to this:

```diff
- event.target.form.submit();
+ naja.uiHandler.submitForm(event.target.form);
```

Now the category filter is handled via Naja and results in an asynchronous request, but we've introduced other issues.

?> You can learn more about manual submission in [UI binding](/ui-binding.md#manual-dispatch).


## Remove the redirect

The first one is quite technical: the server returns a redirect, prompting Naja to dispatch not one but two requests. Let's get rid of the redirect and replace it with the `postGet` URL hint as we did in one of the previous steps. Open the `ProductListPresenter.php` and update the `createComponentCategoryFilter()` method:

```diff
- $this->redirect('this');
+ $this->payload->postGet = true;
+ $this->payload->url = $this->link('this');
```


## Reinitialize the category filter after update

Perhaps the more troubling issue is that the code in `categoryFilter.js` now only works when the page is freshly loaded. Once it is redrawn via Naja, the filter breaks: the "Filter" button appears and the filter does no longer submit automatically when changed.

That's because the filter `<select>` is part of a snippet, and the code in `categoryFilter.js` is executed only in the initial load. When the snippets are redrawn, the code that hides the submit button does not run, and neither does the bit that attaches the submission handler. We need to extract the logic to a function and call it after each and every snippet update.

We'll start by renaming the `initialize` function and adding the root `element` as its parameter instead of hard-coding `document`:

```diff
- const initialize = () => {
-     const categoryFilter = document.querySelector('.categoryFilter');
+ const enableCategoryFilter = (element) => {
+     const categoryFilter = element.querySelector('.categoryFilter');
```

Lastly, we'll make sure that the function is called on initial load, and also after every snippet update by hooking into the SnippetHandler's `afterUpdate` event. For the initial invocation, we need to wait until the DOM is loaded; for that, we'll reuse a tiny utility function called `onDomReady` that's already imported in the script:

```diff
- onDomReady(initialize);
+ onDomReady(() => enableCategoryFilter(document));
+ naja.snippetHandler.addEventListener('afterUpdate', (event) => enableCategoryFilter(event.detail.snippet));
```

?> You can learn more about snippet-related events in [Snippets](/snippets.md#snippet-update-events).

The application should now be fully functional. In the next chapter, we'll discuss the request lifecycle in Naja and how to hook into it.
