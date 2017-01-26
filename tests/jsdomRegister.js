import 'jsdom-global/register';

NodeList.prototype.forEach = function (callback) {
	Array.prototype.forEach.call(this, callback);
};
