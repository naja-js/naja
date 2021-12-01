# Fix the reviews widget

?> If you want to follow along with this step of the tutorial **and don't have the code from the previous step,** checkout a new branch off the `step-4` tag: `git checkout -B follow-along step-4`

In the previous step, we've taken care of the basket and its modifications. The next in line is the third-party product review service widget on the product detail page. It works when you first navigate to the detail of any product, but as soon as you go somewhere else and then return to the product detail, the reviews widget remains hidden and an uncaught error is displayed in the browser's console, saying that 'Reviews is already loaded.'

## Deduplicate the loaded script

Naja executes all `<script>`s it encounters in any of the updated snippets, including the one in `ReviewsControl` that loads and initializes the third-party reviews service SDK. This means that the reviews script gets executed every time the user navigates to a product detail, making the script throw an error because it is not meant to be invoked multiple times.

Naja provides several mechanisms to work around this. The most simple one is script deduplication: we can mark the `<script>` tag with a unique identifier. This will prevent Naja from executing it multiple times. Update the `ReviewsControl.latte` file:

```diff
- <script>
+ <script data-naja-script-id="reviews">
```

Now that the initialization script is only executed once, we need to add a second script that reinitializes the reviews widget using the reviews SDK that we have loaded earlier:

```diff
+ <script>
+     window.reviews && window.reviews.process(document);
+ </script>
```

We are omitting the script identifier this time because we want this to execute every time the user visits a product detail. That way, the third-party SDK is only included on the initial product detail load, and we use its API to reload the reviews widget on every subsequent visit.

?> You can learn more about how Naja loads scripts included in snippets in [Snippets](/snippets.md#scripts-in-snippets).

In the next chapter, we'll take a look at the product list.
