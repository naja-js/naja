export default class Naja {
	initialized = false;

	initialize() {
		if (this.initialized) {
			throw new Error("Cannot initialize Naja, it is already initialized.");
		}

		this.initialized = true;
	}
}
