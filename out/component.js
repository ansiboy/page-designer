define(["require", "exports", "react", "./page-designer", "./errors", "./style", "./common", "./component-panel"], function (require, exports, React, page_designer_1, errors_1, style_1, common_1, component_panel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DesignerContext = React.createContext({ designer: null });
    exports.ComponentWrapperContext = React.createContext(null);
    function component(args) {
        return function (constructor) {
            if (page_designer_1.PageDesigner) {
                Component.setAttribute(constructor.name, args);
            }
            Component.register(constructor.name, constructor);
            return constructor;
        };
    }
    exports.component = component;
    class Component {
        /**
         * 设置组件特性
         * @param typename 组件类型名称
         * @param attr 组件特性
         */
        static setAttribute(typename, attr) {
            Component.componentAttributes[typename] = attr;
        }
        /**
         * 获取组件特性
         * @param typename 组件类型名称
         */
        static getAttribute(type) {
            let typename = typeof type == 'string' ? type : type.name;
            let attr = Component.componentAttributes[typename];
            return Object.assign({ type }, Component.defaultComponentAttribute, attr || {});
        }
        static getPropEditors(controlClassName) {
            let classEditors = this.controlPropEditors[controlClassName] || [];
            return classEditors;
        }
        static getPropEditor(controlClassName, ...propNames) {
            return this.getPropEditorByArray(controlClassName, propNames);
        }
        /** 通过属性数组获取属性的编辑器 */
        static getPropEditorByArray(controlClassName, propNames) {
            let classEditors = this.controlPropEditors[controlClassName] || [];
            let editor = classEditors.filter(o => o.propNames.join('.') == propNames.join('.'))[0];
            return editor;
        }
        static setPropEditor(componentType, propName, editorType, group) {
            group = group || '';
            let propNames = propName.split('.');
            let className = typeof componentType == 'string' ? componentType : componentType.prototype.typename || componentType.name;
            let classProps = Component.controlPropEditors[className] = Component.controlPropEditors[className] || [];
            for (let i = 0; i < classProps.length; i++) {
                let propName1 = classProps[i].propNames.join('.');
                let propName2 = propNames.join('.');
                if (propName1 == propName2) {
                    classProps[i].editorType = editorType;
                    return;
                }
            }
            classProps.push({ propNames: propNames, editorType, group });
        }
        /**
         * 将持久化的元素数据转换为 ReactElement
         * @param componentData 元素数据
         */
        static createElement(componentData, h) {
            if (!componentData)
                throw errors_1.Errors.argumentNull('componentData');
            h = h || React.createElement;
            try {
                let type = componentData.type;
                let componentName = componentData.type;
                let controlType = Component.componentTypes[componentName];
                if (controlType) {
                    type = controlType;
                }
                let children = componentData.children ? componentData.children.map(o => Component.createElement(o, h)) : [];
                let props = componentData.props == null ? {} : JSON.parse(JSON.stringify(componentData.props));
                let result;
                if (typeof type == 'string') {
                    if (props.text) {
                        children.push(props.text);
                    }
                    //=========================================
                    // props.text 非 DOM 的 prop，并且已经使用完
                    delete props.text;
                    if (h == React.createElement) {
                        delete props.attr;
                    }
                    //=========================================
                }
                type = type == Component.Fragment ? React.Fragment : type;
                result = h(type, props, ...children);
                return result;
            }
            catch (e) {
                console.error(e);
                return null;
            }
        }
        static register(componentName, componentType, attr) {
            if (componentType == null && typeof componentName == 'function') {
                componentType = componentName;
                componentName = componentType.name;
                componentType['componentName'] = componentName;
            }
            if (!componentName)
                throw errors_1.Errors.argumentNull('componentName');
            if (!componentType)
                throw errors_1.Errors.argumentNull('componentType');
            Component.componentTypes[componentName] = componentType;
            if (attr)
                Component.setAttribute(componentName, attr);
        }
    }
    //==========================================
    // 用于创建 React 的 React.Fragment 
    Component.Fragment = "";
    //==========================================
    Component.defaultComponentAttribute = {
        container: false, movable: false, showHandler: false, resize: false
    };
    Component.componentAttributes = {
        'div': { container: true, movable: true, showHandler: true, resize: true },
        'img': { container: false, movable: true, resize: true },
        'label': { movable: true },
        'ul': { container: false, movable: true, showHandler: true, resize: false },
        'li': { container: true, movable: false, },
        'table': { container: false, movable: true, showHandler: true, resize: true },
        'thead': { container: false, movable: false },
        'tbody': { container: false, movable: false },
        'tfoot': { container: false, movable: false },
        'tr': { container: false, movable: false },
        'td': { container: true, movable: false },
    };
    Component.controlPropEditors = {};
    Component.componentTypes = {};
    exports.Component = Component;
    exports.MasterPageName = 'MasterPage';
    const MasterPageContext = React.createContext({ form: null });
    class MasterPage extends React.Component {
        constructor(props) {
            super(props);
            let children = this.children(props);
            this.state = { children };
        }
        children(props) {
            let arr = props.children == null ? [] :
                Array.isArray(props.children) ? props.children : [props.children];
            let children = [];
            arr.forEach(o => {
                if (!React.isValidElement(o))
                    return;
                children.push(o);
            });
            return children;
        }
        componentWillReceiveProps(props) {
            let children = this.children(props);
            this.setState({ children });
        }
        render() {
            let props = {};
            for (let key in this.props) {
                if (key == 'ref' || key == 'id')
                    continue;
                props[key] = this.props[key];
            }
            props.style = Object.assign({ minHeight: 40 }, props.style);
            let children = this.state.children.filter(o => o.props.parent_id == null);
            return React.createElement(MasterPageContext.Provider, { value: { form: this } }, children);
        }
    }
    exports.MasterPage = MasterPage;
    Component.register(exports.MasterPageName, MasterPage, { container: false });
    /**
     * 占位符，用于放置控件
     */
    class PlaceHolder extends React.Component {
        constructor(props) {
            super(props);
            if (!this.props.id) {
                throw errors_1.Errors.placeHolderIdNull();
            }
        }
        /**
         * 启用拖放操作，以便通过拖放图标添加控件
         */
        enableAppendDroppable(element, host) {
            if (element.getAttribute('enable-append-droppable'))
                return;
            element.setAttribute('enable-append-droppable', 'true');
            console.assert(element != null);
            element.addEventListener('dragover', function (event) {
                event.preventDefault();
                event.stopPropagation();
                element.className = style_1.appendClassName(element.className || '', 'active');
                let componentName = event.dataTransfer.getData(common_1.constants.componentData);
                if (componentName)
                    event.dataTransfer.dropEffect = "copy";
                else
                    event.dataTransfer.dropEffect = "move";
                console.log(`dragover: left:${event.layerX} top:${event.layerX}`);
            });
            let func = function (event) {
                event.preventDefault();
                event.stopPropagation();
                element.className = style_1.removeClassName(element.className, 'active');
            };
            element.addEventListener('dragleave', func);
            element.addEventListener('dragend', func);
            element.addEventListener('dragexit', func);
            element.ondrop = (event) => {
                event.preventDefault();
                event.stopPropagation();
                element.className = style_1.removeClassName(element.className, 'active');
                let ctrl;
                if (event.dataTransfer)
                    ctrl = component_panel_1.ComponentPanel.getComponentData(event.dataTransfer);
                if (!ctrl)
                    return;
                console.assert(this.props.id != null);
                console.assert(this.designer != null);
                ctrl.props.parent_id = this.props.id;
                console.assert(host != null, 'host is null');
                this.designer.appendComponent(host.props.id, ctrl);
            };
        }
        enableMoveDroppable(element, host) {
            if (element.getAttribute('enable-move-droppable'))
                return;
            element.setAttribute('enable-move-droppable', 'true');
            $(element)
                .drop('start', (event, dd) => {
                if (dd.sourceElement.id == this.wraper.props.source.props.id)
                    return;
                style_1.appendClassName(element, 'active');
            })
                .drop('drop', (event, dd) => {
                if (dd.sourceElement.id == this.wraper.props.source.props.id)
                    return;
                let componentData = this.designer.findComponentData(dd.sourceElement.id);
                console.assert(componentData != null);
                let propName = 'parent_id';
                this.designer.moveControl(dd.sourceElement.id, host.props.id);
                this.designer.updateControlProps(dd.sourceElement.id, [propName], this.props.id);
            })
                .drop('end', (event, dd) => {
                if (dd.sourceElement.id == this.wraper.props.source.props.id)
                    return;
                style_1.removeClassName(element, 'active');
            });
        }
        render() {
            let empty = this.props.empty || React.createElement("div", { key: common_1.guid(), className: "empty" }, "\u53EF\u4EE5\u62D6\u62C9\u63A7\u4EF6\u5230\u8FD9\u91CC");
            return React.createElement(MasterPageContext.Consumer, null, (args) => {
                let host = args.form;
                if (host == null)
                    throw errors_1.Errors.canntFindHost(this.props.id);
                let children = [];
                if (host.props && host.props.children) {
                    let arr;
                    if (Array.isArray(host.props.children)) {
                        arr = host.props.children;
                    }
                    else {
                        arr = [host.props.children];
                    }
                    children = arr.filter((o) => o.props.parent_id != null && o.props.parent_id == this.props.id);
                }
                return React.createElement(exports.DesignerContext.Consumer, null, args => React.createElement(exports.ComponentWrapperContext.Consumer, null, wraper => {
                    this.wraper = wraper;
                    console.assert(this.wraper != null);
                    if (args.designer != null && children.length == 0) {
                        children = [empty];
                    }
                    let element = React.createElement(React.Fragment, null,
                        this.props.children,
                        children);
                    if (args.designer) {
                        this.designer = args.designer;
                        element = React.createElement("div", { key: common_1.guid(), className: style_1.classNames.placeholder, ref: e => {
                                if (!e)
                                    return;
                                this.element = e;
                                this.enableAppendDroppable(e, host);
                                this.enableMoveDroppable(e, host);
                            } }, element);
                    }
                    return element;
                }));
            });
        }
    }
    exports.PlaceHolder = PlaceHolder;
    Component.register('PlaceHolder', PlaceHolder);
    class PageView extends React.Component {
        constructor(props) {
            super(props);
            if (!this.props.pageData)
                throw errors_1.Errors.propCanntNull(PageView.name, 'pageData');
        }
        render() {
            let element = Component.createElement(this.props.pageData);
            return element;
        }
    }
    exports.PageView = PageView;
});
//# sourceMappingURL=component.js.map