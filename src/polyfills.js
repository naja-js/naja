// https://bugs.webkit.org/show_bug.cgi?id=174980
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';

// https://github.com/whatwg/dom/pull/467
import {EventTarget} from 'event-target-shim';
try {
	new window.EventTarget();
} catch (error) {
	window.EventTarget = EventTarget;
}
