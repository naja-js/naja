import {Naja, HttpError} from './Naja';
import {AbortExtension} from './extensions/AbortExtension';
import {UniqueExtension} from './extensions/UniqueExtension';


const naja = new Naja();
naja.registerExtension(new AbortExtension());
naja.registerExtension(new UniqueExtension());

(naja as any).Naja = Naja;
(naja as any).HttpError = HttpError;

export default naja;
