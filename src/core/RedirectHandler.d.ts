export interface LocationAdapter {
	assign(url: string): void;
}

export declare class RedirectHandler {
	public locationAdapter: LocationAdapter;
	public makeRedirect(url: string | URL, force: boolean): void;
}
