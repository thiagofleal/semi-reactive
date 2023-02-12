export function parseHTML(str) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(str, "text/html");
	return doc.body;
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

export function attrComponent(component, element) {
	for (let child of element.childNodes) {
		child._component = component;
		child._element = element.closest(component.getSelector());
		if (!child.component) {
			Object.defineProperty(child, "component", {
				get: () => {
					component.__setElement(child._element);
					return child._component;
				}
			});
		}
		if (child.setAttribute && typeof child.setAttribute === "function") {
			child.setAttribute("component", component.getId());
		}
		attrComponent(component, child);
	}
}
