export function createElement(str) {
	const elem = document.createElement("div");
	elem.innerHTML = str;
	return elem;
}

export function getAllAttributesFrom(element) {
	const attributes = {};
	Array.from(element.attributes).forEach(attr => {
		attributes[attr.nodeName] = attr.nodeValue;
	});
	return attributes;
}

export function randomString(length) {
  const chars = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789";
  let ret = "";

  for (let i = 0; i < length; i++) {
    ret += chars.charAt(Math.ceil(Math.random() * chars.length));
  }
  return ret;
}

export function getElementClasses(element, ignore) {
	if (!ignore) ignore = [];
	if (!Array.isArray(ignore)) ignore = [ignore];
	if (element) {
		return element.className.split(" ").filter(e => !ignore.includes(e));
	}
	return [];
}

export function sleep(time) {
	return new Promise(r => setTimeout(r, time));
}
