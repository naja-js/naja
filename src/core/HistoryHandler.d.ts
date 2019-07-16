export interface HistoryAdapter {
	replaceState(data: any, title: string, url: string): void;
	pushState(data: any, title: string, url: string): void;
}

export declare class HistoryHandler {
	public historyAdapter: HistoryAdapter;
	public uiCache: boolean;
}
