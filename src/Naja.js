import qwest from 'qwest';
import objectAssign from 'object-assign';
import EventTarget from 'event-target-shim';


export default class Naja extends EventTarget {
	initialized = false;

	initialize() {
		if (this.initialized) {
			throw new Error("Cannot initialize Naja, it is already initialized.");
		}

		this.fireEvent('init');
		this.initialized = true;
		this.load();
	}


	load() {
		this.fireEvent('load');
	}


	fireEvent(type, args = {}) {
		const evt = Object.assign(args, {type, cancelable: true});
		return this.dispatchEvent(evt);
	}
}
