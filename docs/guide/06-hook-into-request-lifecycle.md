# Hook into the request lifecycle

?> If you want to follow along with this step of the tutorial **and don't have the code from the previous step,** checkout a new branch off the `step-6` tag: `git checkout -B follow-along step-6`

The whole application is finally functional, at least at first glance. You can click through the whole application and everything should seem to be working as expected. However, there are still some things waiting for repair. They are not so obvious, but they are there nonetheless.

## Event system

As you might have already noticed at the end of the previous chapter, Naja and some of its core components dispatch various events at certain points of the request lifecycle and during the processing of the response, for instance after updating every single snippet:

```js
naja.snippetHandler.addEventListener('afterUpdate', (event) => enableCategoryFilter(event.detail.snippet));
```

The API should look familiar. Naja builds on top of established web standards, so all its event-dispatching components implement the `EventTarget` interface you already know from the DOM API, and all the dispatched events are instances of `CustomEvent`.

The event system is designed to allow you to hook _deep_ into Naja's capabilities and extend them or integrate them with your own or third-party scripts. Events are very simple, but at the same time very flexible and very powerful: some of them expose very internal options that allow you to change the behaviour of Naja's components or bypass them altogether.

?> The specific events and their contents are explained in detail in the [Events reference](/events.md).

## Track pageviews

If you deployed the changes we've done so far into production, it would probably not take long for you to hear screams of horror from the marketing team. Their precious web analytics tool would show a significant decrease in pageviews. That's because the tracking script in `<head>` is not part of any snippet. It only gets executed on the initial page load, but not when the user subsequently navigates the page.

While we could wrap the script in a snippet, deduplicate it and add another track-new-pageview script, like we did with the [reviews widget](04-fix-reviews-widget.md), let's use a different approach this time. The reviews widget is local to a single page, so it's somewhat acceptable to let it lay in a template. But the web analytics spans the whole website and should probably have a more prominent place.

We'll keep the initialization script in the `<head>`. If we incorporated it into our scripts bundle, an error in any of our scripts could disable the analytics, which is not desirable. But we will create a separate script that hooks into Naja's events and tracks a pageview whenever Naja navigates to a new page.

Create an `analytics.js` file and start by importing Naja into it:

```js
import naja from 'naja';
```

In addition to events related to specific Naja's capabilities, Naja itself dispatches a set of events throughout the lifecycle of the request. In this case, we need the `success` event that is dispatched when an asynchronous request made by Naja yields a successful response from the server:

```js
naja.addEventListener('success', (event) => {
	// do not track local actions
	if (event.detail.options.history !== 'replace') {
		window.analytics?.trackPageview(/* url, title */);
	}
});
```

Lots of Naja's components use the exact same event. They are prioritized so that you can be sure that when your listener is executed, all snippets have already been updated (and cached in the browser history) and the URL has been rewritten. Thus, you can safely omit the `url` and `title` optional arguments of the `trackPageview()` method because it can infer them from the browser state.

?> You can learn more about Naja's request lifecycle events in [Events reference](/events.md#request-lifecycle).

Speaking of browser history, to mimic the browser's handling of history navigation, we'll also need to track a pageview when the user navigates back and forth. We'll use the `restoreState` event of `HistoryHandler`. Again, the snippets have been restored from cache and the URL has been reverted by the time the listener is executed:

```js
naja.historyHandler.addEventListener('restoreState', () => window.analytics?.trackPageview());
```

?> You can learn more about history-related events in [History](/history.md#history-integration-events).

Finally, import the script into the `index.js`:

```diff
+ import './analytics';
```

You can easily check that everything is working by opening the browser's development console and running `window.analytics.listPageviews()`.

## Handle errors in request

So far we've covered the happy path, but what happens when something goes wrong?

When you dispatch requests manually (either via [`makeRequest()`](/dispatch.md) or [manual UI dispatch](/ui-binding.md#manual-dispatch)), you can respond to errors by awaiting the completion of the returned promise. But with the user's UI interactions, you don't have such liberty – network and response processing errors are silently discarded so as not to disrupt the user's experience.

Luckily, before Naja throws the error away, it exposes it in the `error` event. Let's inform the user that something went wrong by displaying a toast to them.

Create the `errorHandler.js` file:

```js
import naja from 'naja';
naja.addEventListener('error', () => {
	const toast = document.createElement('div');
	toast.classList.add('toast');
	toast.innerHTML = '<strong>There was an error processing the request :(</strong>Please try again later.';
	document.body.appendChild(toast);
	window.setTimeout(() => document.body.removeChild(toast), 2000);
});
```

And import the file into the `index.js`:

```diff
+ import './errorHandler';
```

?> If you use an error-tracking service such as [Sentry](https://sentry.io), it could also be useful at this point to log the error there so that you can investigate it later.

In the next chapter, we'll talk about extensions and learn how to extend Naja's functionality in a coherent and reusable way.
