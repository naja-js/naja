import {Naja} from './Naja';
import {AbortExtension} from './extensions/AbortExtension';
import {UniqueExtension} from './extensions/UniqueExtension';


const naja = new Naja();
naja.registerExtension(new AbortExtension());
naja.registerExtension(new UniqueExtension());

export {Naja, HttpError} from './Naja';
export default naja;
