import './polyfills';

import {Naja} from './Naja';
import {AbortExtension} from './extensions/AbortExtension';
import {UniqueExtension} from './extensions/UniqueExtension';


const naja = new Naja();
naja.registerExtension(AbortExtension);
naja.registerExtension(UniqueExtension);

export {HttpError} from './Naja';
export default naja;
