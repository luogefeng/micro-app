// 判断节点是否为文本类型
function isTextVdom(vdom) {
    return typeof vdom == 'string' || typeof vdom == 'number';
}

// 判断节点是否为元素类型
function isElementVdom(vdom) {
    return typeof vdom == 'object' && typeof vdom.type == 'string';
}

// 判断vdom是否是Component
function isComponentVdom(vdom) {
    return typeof vdom.type == 'function';
}

// 渲染函数
const render = (vdom, parent = null) => {
    const mount = parent ? (el => parent.appendChild(el)) : (el => el);
    if (isTextVdom(vdom)) {
        return mount(document.createTextNode(vdom));  //创建文本节点
    } else if (isElementVdom(vdom)) {
        const dom = mount(document.createElement(vdom.type));  //创建元素节点
        // 递归渲染子节点
        for (const child of [].concat(...vdom.children)) {
            render(child, dom);
        }
        // 设置属性
        for (const prop in vdom.props) {
            setAttribute(dom, prop, vdom.props[prop]);
        }
        return dom;
    } else if (isComponentVdom(vdom)) {
        return renderComponent(vdom, parent);
    } else {
        throw new Error(`Invalid VDOM: ${vdom}.`);
    }
};

// 渲染类组件的处理
function renderComponent(vdom, parent) {
    const props = Object.assign({}, vdom.props, {
        children: vdom.children
    });

    if (Component.isPrototypeOf(vdom.type)) {
        const instance = new vdom.type(props);

        instance.componentWillMount();

        const componentVdom = instance.render();
        instance.dom = render(componentVdom, parent);
        instance.dom.__instance = instance;
        instance.dom.__key = vdom.props.key;

        instance.componentDidMount();

        return instance.dom;
    } else {
        const componentVdom = vdom.type(props);
        return render(componentVdom, parent);
    }
}

function patch(dom, vdom, parent = dom.parentNode) {
    const replace = parent ? el => {
        parent.replaceChild(el, dom);
        return el;
    } : (el => el);

    // 要判断下 dom 是不是同一个组件渲染出来的，不是的话，直接替换，是的话更新子元素
    if(isComponentVdom(vdom)) {
        const props = Object.assign({}, vdom.props, {children: vdom.children});
        // 对比下 constructor 是否相同，如果一样说明是同一个组件
        if (dom.__instance && dom.__instance.constructor == vdom.type) {
            dom.__instance.componentWillReceiveProps(props);
            dom.__instance.props = props;
            return patch(dom, dom.__instance.render(), parent);
        } 
        // class 组件的替换
        else if (Component.isPrototypeOf(vdom.type)) {
            const componentDom = renderComponent(vdom, parent);
            if (parent){
                parent.replaceChild(componentDom, dom);
                return componentDom;
            } else {
                return componentDom
            }
        } 
        // function 组件的替换
        else if (!Component.isPrototypeOf(vdom.type)) {
            return patch(dom, vdom.type(props), parent);
        }
    }

    // 判断 dom 节点是否是文本
    else if (dom instanceof Text) {
        // 如果 vdom 不是文本节点，直接替换
        if (typeof vdom === 'object') {
            return replace(render(vdom, parent));
        } 
        // 如果 vdom 也是文本节点，就对比内容，内容不一样就替换
        else {
            return dom.textContent != vdom ? replace(render(vdom, parent)) : dom;
        }
    } 
    // dom 是元素的话，要看下是否是同一类型的：不同类型的元素，直接替换
    else if (dom.nodeName !== vdom.type.toUpperCase() && typeof vdom === 'object') {
        return replace(render(vdom, parent));
    } 

    //dom 是元素的话， 同一类型的元素，更新子节点和属性
    else if(dom.nodeName === vdom.type.toUpperCase() && typeof vdom === 'object'){
        const active = document.activeElement;

        const oldDoms = {};
        [].concat(...dom.childNodes).map((child, index) => {
            const key = child.__key || `__index_${index}`;
            oldDoms[key] = child;
        });
        [].concat(...vdom.children).map((child, index) => {
            const key = child.props && child.props.key || `__index_${index}`;
            dom.appendChild(oldDoms[key] ? patch(oldDoms[key], child) : render(child, dom));
            delete oldDoms[key];
        });
        for (const key in oldDoms) {
            const instance = oldDoms[key].__instance;
            if (instance) instance.componentWillUnmount();
            oldDoms[key].remove();
        }
        for (const attr of dom.attributes) dom.removeAttribute(attr.name);
        for (const prop in vdom.props) setAttribute(dom, prop, vdom.props[prop]);

        active.focus();

        return dom;
    }
}

// 判断是否为时间监听属性
function isEventListenerAttr(key, value) {
    return typeof value == 'function' && key.startsWith('on');
}

// 判断是否为样式属性
function isStyleAttr(key, value) {
    return key == 'style' && typeof value == 'object';
}

function isPlainAttr(key, value) {
    return typeof value != 'object' && typeof value != 'function';
}

function isRefAttr(key, value) {
    return key === 'ref' && typeof value === 'function';
}

// 设置属性
const setAttribute = (dom, key, value) => {
    if (isEventListenerAttr(key, value)) {
        const eventType = key.slice(2).toLowerCase();
        dom.__handlers = dom.__handlers || {};
        dom.removeEventListener(eventType, dom.__handlers[eventType]);
        dom.__handlers[eventType] = value;
        dom.addEventListener(eventType, dom.__handlers[eventType]);
    } else if (key == 'checked' || key == 'value' || key == 'className') {
        dom[key] = value;
    } else if(isRefAttr(key, value)) {
        value(dom);
    } else if (isStyleAttr(key, value)) {
        Object.assign(dom.style, value);
    } else if (key == 'key') {
        dom.__key = value;
    } else if (isPlainAttr(key, value)) {
        dom.setAttribute(key, value);
    }
}

// 创建元素
const createElement = (type, props, ...children) => {
    if (props === null)  props = {};
    return {type, props, children};
};

// class组件
class Component {
    constructor(props) {
        this.props = props || {};
        this.state = null;
    }
  
    setState(nextState) {
        this.state = Object.assign(this.state, nextState);
        if(this.dom && this.shouldComponentUpdate(this.props, nextState)) {
            patch(this.dom, this.render());
        }
    }

    // 判断是否需要更新
    shouldComponentUpdate(nextProps, nextState) {
        return nextProps != this.props || nextState != this.state;
    }

    componentWillMount() {}
  
    componentDidMount() {}

    componentWillReceiveProps() {}

    componentWillUnmount() {}
}
