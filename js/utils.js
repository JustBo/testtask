function createElement(el, props) {
    let children = Array.prototype.slice.call(arguments, 2);
    let element = document.createElement(el);
    for (let name in props) {
        if (typeof props[name] === "function") {
            element.addEventListener(name, props[name]);
        } else {
            element.setAttribute(name, props[name]);
        }
    }
    for (let key in children) {
        let child = children[key];
        if (Array.isArray(child)) {
            for (let node in child) {
                element.appendChild(child[node]);
            }
        } else if (typeof (child) === 'object') {
            element.appendChild(child);
        } else {
            element.innerHTML += child;
        }
    }
    return element;
}