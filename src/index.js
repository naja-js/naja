import './polyfills';

import {Naja, HttpError} from './Naja';
import {AbortExtension} from './extensions/AbortExtension';
import {UniqueExtension} from './extensions/UniqueExtension';


const naja = new Naja();
naja.registerExtension(new AbortExtension());
naja.registerExtension(new UniqueExtension());

naja.Naja = Naja;
naja.HttpError = HttpError;

export default naja;
