# Write some extensions

?> If you want to follow along with this step of the tutorial **and don't have the code from the previous step,** checkout a new branch off the `step-7` tag: `git checkout -B follow-along step-7`

In the penultimate step of the guide, we'll write a few extensions. Extensions allow you to group event listeners that together create a coherent unit of behaviour.

## Category filter as an extension

We'll start by rewriting the `categoryFilter.js` script into an extension. Since extensions have to be explicitly registered into Naja, it's a good practice to wrap all logic that attaches onto Naja into extensions, and register them all in one place. That way, you can easily look up all listeners, making any debugging much easier.

An extension has to implement an `initialize(naja)` method which serves as its main entrypoint. This method is called as soon as Naja is initialized. The DOM might not be loaded by then, so we'll keep the `onDomReady` utility in action. Let's take the easiest route and wrap the whole current code in an extension:

```js
const categoryFilterExtension = {
	initialize(naja) {
		const enableCategoryFilter = () => {/* ... */};

		onDomReady(() => enableCategoryFilter(document));
		naja.snippetHandler.addEventListener('afterUpdate', (event) => enableCategoryFilter(event.detail.snippet));
    }
};
```

Since `naja` is now a parameter of the extension's initializer, we can safely remove the import:

```diff
- import naja from 'naja';
```

...and export the extension instead:

```diff
- const categoryFilterExtension = {
+ export const categoryFilterExtension = {
```

...so that we can import it and register it in the `index.js` file:

```diff
- import './categoryFilter';
+ import {categoryFilterExtension} from './categoryFilter';
```

```diff
+ naja.registerExtension(categoryFilterExtension);
  naja.initialize();
```

?> You can learn more about writing custom extensions in [Writing extensions](/extensions-custom.md).

## Spinner extension

The true power of extensions manifests itself when you need to listen for multiple Naja's events and pass some arbitrary data between them. Extensions help you keep this interconnected and interdependent code in one place.

If you're running the project locally, it's probably swishing fast. But that might not be the case in production environments. Let's add a spinner to indicate to the user that the page is loading when there is some network latency. Create the `spinner.js` file and implement the following extension:

```js
import onDomReady from './onDomReady';

export const spinnerExtension = {
	initialize(naja) {
		onDomReady(() => {
			const mainContent = document.querySelector('.mainContent');
			naja.addEventListener('start', () => mainContent.classList.add('spinner'));
			naja.addEventListener('complete', () => mainContent.classList.remove('spinner'));
		});
    }
}
```

The extension listens for the request's lifecycle events: `start` is triggered when the request is dispatched, and `complete` is triggered as soon as it completes, regardless of the outcome. In this scenario, we're showing and hiding an overlay with a spinner over the main content.

Let's open the `index.js` file and import and register the extension:

```diff
+ import {spinnerExtension} from './spinner';
```

```diff
+ naja.registerExtension(spinnerExtension);
  naja.initialize();
```

?> You can learn more about request lifecycle events in [Events reference](/events.md#request-lifecycle).


### Localize the spinner

We don't always need the spinner to show over the whole content. For instance, when adding a product to the basket, we might only show the spinner over the respective button. Let's introduce another event into the mix:

```diff
  const mainContent = document.querySelector('.mainContent');
+ naja.uiHandler.addEventListener('interaction', (event) => {
+     event.detail.options.spinnerTarget = event.detail.element.closest('[data-spinner]');
+ });
```

The `interaction` event is triggered when the user clicks a link or submits a form marked with the `.ajax` class. It allows us to query the clicked `element` and alter the `options`. The `options` is a mutable object that is recreated for each interaction or request that Naja processes, and can be used to pass arbitrary data between multiple listeners. In this case, we're looking up an element with a `data-spinner` data-attribute and storing it in the options.

The following listeners can then read the data from `options` and only fall back to the `mainContent` if no local spinner target is configured:

```diff
- naja.addEventListener('start', () => mainContent.classList.add('spinner'));
- naja.addEventListener('complete', () => mainContent.classList.remove('spinner'));
+ naja.addEventListener('start', (event) => (event.detail.options.spinnerTarget ?? mainContent).classList.add('spinner'));
+ naja.addEventListener('complete', (event) => (event.detail.options.spinnerTarget ?? mainContent).classList.remove('spinner'));
```

With this in place, we can update the `AddToBasketControl.latte` template and add the data-attribute:

```diff
- <div class="addToBasket">
+ <div class="addToBasket" data-spinner>
```

### Make the extension reusable

As a final touch, we could make the extension better reusable by requiring some hard-coded values to be configured from outside. We'll turn the object into a class so that it can accept any configuration value in the constructor:

```diff
- export const spinnerExtension = {
+ export class SpinnerExtension {
+     constructor(fallbackSelector) {
+         this.fallbackSelector = fallbackSelector;
+     }
```

We'll then use this value in the initializer:

```diff
- const mainContent = document.querySelector('.mainContent');
+ const mainContent = document.querySelector(this.fallbackSelector);
```

And then change the usage in `index.js`, passing the `.mainContent` selector as the constructor argument:

```diff
- import {spinnerExtension} from './spinner';
+ import {SpinnerExtension} from './spinner';
```

```diff
- naja.registerExtension(spinnerExtension);
+ naja.registerExtension(new SpinnerExtension('.mainContent'));
```

This way, the extension itself can easily be shared and reused in a different application that uses a different class name for the main element. In the final chapter of this guide, we'll just tie up the very last loose ends and then we'll be done.
