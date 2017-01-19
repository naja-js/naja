import Naja from './Naja';


const naja = new Naja();
document.addEventListener('DOMContentLoaded', naja.initialize.bind(naja));

window.Naja = naja;
export default naja;
