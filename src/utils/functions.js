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

function getNodeType(node) {
	if (node.nodeType === 3) return "text";
	if (node.nodeType === 8) return "comment";
	return node.tagName.toLowerCase();
}

function getNodeContent(node) {
	if (node.childNodes && node.childNodes.length > 0) return null;
	return node.textContent;
}

function diffAttributes(template, element) {
	const templateAttributes = getAllAttributesFrom(template);
	const elementAttributes = getAllAttributesFrom(element);

	for (const key in elementAttributes) {
		if (!template.getAttribute(key)) {
			element.removeAttribute(key);
		}
	}
	for (const key in templateAttributes) {
		if (template.getAttribute(key) !== element.getAttribute(key)) {
			element.setAttribute(key, template.getAttribute(key));
		}
	}
}

export function diff(template, element) {
	const domNodes = Array.prototype.slice.call(element.childNodes);
	const templateNodes = Array.prototype.slice.call(template.childNodes);
	let count = domNodes.length - templateNodes.length;

	if (count > 0) {
		for (; count > 0; count--) {
			domNodes[domNodes.length - count].parentNode.removeChild(domNodes[domNodes.length - count]);
		}
	}
	templateNodes.forEach((node, index) => {
		if (!domNodes[index]) {
			element.appendChild(node.cloneNode(true));
			return;
		}
		if (getNodeType(node) !== getNodeType(domNodes[index])) {
			domNodes[index].parentNode.replaceChild(node.cloneNode(true), domNodes[index]);
			return;
		}
		const templateContent = getNodeContent(node);
		if (templateContent && templateContent !== getNodeContent(domNodes[index])) {
			domNodes[index].textContent = templateContent;
		}
		if (domNodes[index].childNodes.length > 0 && node.childNodes.length < 1) {
			domNodes[index].innerHTML = "";
			return;
		}
		if (domNodes[index].childNodes.length < 1 && node.childNodes.length > 0) {
			const fragment = document.createDocumentFragment();
			diff(node, fragment);
			domNodes[index].appendChild(fragment);
			return;
		}
		if (node.childNodes.length > 0) {
			diff(node, domNodes[index]);
		}
		diffAttributes(node.parentElement, domNodes[index].parentElement);
	});
}
