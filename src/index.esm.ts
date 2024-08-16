import {Naja} from './Naja';
import {AbortExtension} from './extensions/AbortExtension';
import {UniqueExtension} from './extensions/UniqueExtension';


const naja = new Naja();
naja.registerExtension(new AbortExtension());
naja.registerExtension(new UniqueExtension());

export type {InitEvent, BeforeEvent, StartEvent, AbortEvent, PayloadEvent, SuccessEvent, ErrorEvent, CompleteEvent} from './Naja';
export type {BuildStateEvent, RestoreStateEvent} from './core/HistoryHandler';
export type {RedirectEvent} from './core/RedirectHandler';
export type {StoreEvent, FetchEvent, RestoreEvent} from './core/SnippetCache';
export type {BeforeUpdateEvent, PendingUpdateEvent, AfterUpdateEvent} from './core/SnippetHandler';
export type {InteractionEvent} from './core/UIHandler';

export type {HistoryState} from './core/HistoryHandler';
export type {Extension, Options, Payload} from './Naja';

export {Naja, HttpError} from './Naja';
export default naja;
