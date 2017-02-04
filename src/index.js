import Naja from './Naja';
import AbortExtension from './extensions/AbortExtension';
import UniqueExtension from './extensions/UniqueExtension';


const naja = new Naja();
naja.registerExtension(AbortExtension);
naja.registerExtension(UniqueExtension);

document.addEventListener('DOMContentLoaded', naja.initialize.bind(naja));

window.Naja = naja;
export default naja;
