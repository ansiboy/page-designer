/// <reference path="../out/pdesigner.d.ts"/>

import { ComponentToolbar, PageDesigner, ControlDescription, guid, Control, DesignerContext, EditorPanel, Editor, PageView } from "pdesigner";
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { componets } from "./components/componenDefines";
import 'less!index';

let container = document.getElementById('container');

let controlDescription: ControlDescription = {
    "id": "c9289d06-abcc-134e-b6a9-8e2eddab8bf2",
    "name": "PageView",
    "data": {
        "className": "page-view",
        "style": {}
    },
    "children": [
        {
            "id": "dabb6966-8ca9-2fea-c60d-cc3ff0d77f22",
            "name": "header",
            "children": [
                {
                    "id": "5844958c-f8e5-2f83-d290-a9ee2b36aaec",
                    "name": "ControlPlaceholder",
                    "data": {
                        "style": {
                            "minHeight": 80,
                            "border": "dotted 3px #ccc"
                        }
                    }
                }
            ]
        },
        {
            "id": "31d0cfcf-a4a2-a7f6-65b6-95a9e0678ff3",
            "name": "section",
            "data": {
                "style": {
                    "margin": "8px 0 8px 0"
                }
            },
            "children": [
                {
                    "id": "181c33a2-e2fd-9d79-ae08-c8a97cfb1f04",
                    "name": "ControlPlaceholder",
                    "data": {
                        "style": {
                            "minHeight": 200,
                            "border": "dotted 3px #ccc"
                        }
                    },
                    "children": [
                        {
                            "id": "8b018486-69de-f595-eabf-909bad85e97a",
                            "name": "test",
                            "data": {
                                "label": "未命名"
                            }
                        }
                    ]
                }
            ]
        },
        {
            "id": "5b4d1783-8a85-e8a7-7712-0446519c59d4",
            "name": "footer",
            "children": [
                {
                    "id": "1b6fcd03-5d39-03eb-f586-53ecb1ad2cf7",
                    "name": "ControlPlaceholder",
                    "data": {
                        "style": {
                            "minHeight": 80,
                            "border": "dotted 3px #ccc"
                        }
                    },
                    "children": [
                        {
                            "id": "2df4fb2e-d54f-517f-fac5-423b1ef23e0e",
                            "name": "test",
                            "data": {
                                "label": "未命名"
                            }
                        }
                    ]
                }
            ]
        }
    ]
}

class PageViewEditor extends Editor<any, any> {
    element: HTMLElement;
    render() {
        return <div ref={(e: HTMLElement) => this.element = e || this.element}>
            PageView Editor
        </div>
    }
}

Editor.register('PageView', PageViewEditor);
// Control.register('Test', '')
Control.register('test', 'components/Test/control');
Editor.register('test', 'components/Test/editor');

let pageViewElement: HTMLElement;
let designer: PageDesigner;

const MyDesignerContext = PageDesigner.createContext({ designer, page: null })

function renderPageData(pageData: ControlDescription) {
    return <div className="main-panel">
        <ul className="nav nav-tabs">
            <li role="presentation" className="bg-primary"><a href="#">页面一</a></li>
            <li role="presentation"><a href="#">页面二</a></li>
            <li role="presentation"><a href="#">页面三</a></li>
        </ul>
        <div style={{ padding: 0 }}>
            <div ref={async (e: HTMLElement) => {
                pageViewElement = e || pageViewElement;

                let element = await Control.create(pageData);
                ReactDOM.render(<DesignerContext.Provider value={{ designer }}>
                    {element}
                </DesignerContext.Provider>, pageViewElement)
            }}></div>
        </div>
    </div>
}

class MainPage extends React.Component<any, any>{
    pageView: PageView;
    pageDesigner: PageDesigner;

    constructor(props) {
        super(props);
        controlDescription.data.ref = (c: PageView) => {
            if (!c) return;
            this.pageView = c;
        }
    }

    save() {
        let pageData = Control.export(this.pageView);
        alert(JSON.stringify(pageData));
    }
    render() {
        return <PageDesigner pageData={controlDescription}
            ref={(e) => this.pageDesigner = e || this.pageDesigner} >
            <ul>
                <li className="pull-left">
                    <h3 style={{ margin: 0, padding: '0 0 0 10px' }}>好易页面设计器</h3>
                </li>
                <li className="pull-right">
                    <button className="btn btn-primary"
                        onClick={(e) => this.save()}>
                        <i className="icon-save" />
                        <span style={{ paddingLeft: 4 }}>保存</span>
                    </button>
                </li>
                <li className="pull-right">
                    <button className="btn btn-primary">
                        <i className="icon-eye-open" />
                        <span style={{ paddingLeft: 4 }}>预览</span>
                    </button>
                </li>
            </ul>
            <div className="clearfix" />
            <hr style={{ margin: 0, borderWidth: 4 }} />

            <ComponentToolbar className="component-panel" componets={componets} />
            <EditorPanel className="editor-panel" />
            <DesignerContext.Consumer>
                {context => {
                    designer = context.designer;
                    return renderPageData(context.designer.state.pageData)
                }}
            </DesignerContext.Consumer>
        </PageDesigner>
    }
}


ReactDOM.render(<MainPage />, container);