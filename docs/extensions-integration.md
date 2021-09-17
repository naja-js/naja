# Integrating with third-party services

## Loading a third-party widget

This extension shows how to integrate various third-party widgets such as social media buttons, discussions, maps, etc. It loads (and reloads) third-party widgets in updated snippets:

```js
class ThirdPartyMapsExtension {
	// accept apiKey as a parameter to make the extension reusable
	constructor(apiKey) {
		this.apiKey = apiKey;
    }

	initialize(naja) {
		// do an initial load
		if (document.readyState !== 'loading') {
			this.reload(document.body);
        } else {
			document.addEventListener('DOMContentLoaded', () => this.reload(document.body));
		}

		// and attach a reload handler on every snippet update
		naja.snippetHandler.addEventListener('afterUpdate', (event) => {
			this.reload(event.detail.snippet);
        });
    }

    reload(element) {
        const maps = element.querySelectorAll('[data-third-party-maps]');

	    // bail out if there is no third.party.maps map in the element
		if (maps.length === 0) {
			return;
        }

		// load the SDK if it is not yet loaded
		if ( ! window.third.party.maps) {
			return this.load();
		}

		// call the SDK
		for (const map of maps) {
			window.third.party.maps.attach(map);
		}
    }

	load() {
		const script = document.createElement('script');
		script.src = `https://third.party.maps/sdk.js?apiKey=${this.apiKey}`;
		document.head.appendChild(script);
    }
}
```

## Tracking page views

This extension sends successful AJAX requests as pageviews into a web analytics software:

```js
class AnalyticsExtension {
	constructor(apiKey) {
		this.apiKey = apiKey;
    }

	initialize(naja) {
		const script = document.createElement('script');
		script.src = 'https://third.party.analytics/tracker.js';
		document.head.appendChild(script);

		third.party.analytics.push('init', this.apiKey);

		naja.addEventListener('success', (event) => {
			const url = event.detail.payload.url ?? event.detail.request.url;
			third.party.analytics.push('pageView', url);
        });
    }
}
```


## Tracking errors

A similar mechanism can also be used to keep track of errors in production by sending them into a monitoring tool such as Sentry:

```js
class ErrorTrackerExtension {
	constructor(apiKey) {
		this.apiKey = apiKey;
	}

	initialize(naja) {
		const script = document.createElement('script');
		script.src = 'https://third.party.errorTracker/sdk.js';
		document.head.appendChild(script);

		third.party.errorTracker.init(this.apiKey);

		naja.addEventListener('error', (event) => {
			third.party.errorTracker.sendError(event.detail.error);
        });
    }
}
```
