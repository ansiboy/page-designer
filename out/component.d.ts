import * as React from "react";
import { ComponentAttribute, ComponentWrapper } from "./component-wrapper";
import { PageDesigner } from "./page-designer";
import { PropEditorConstructor } from "./prop-editor";
import { ComponentData } from "./models";
/*******************************************************************************
 * Copyright (C) maishu All rights reserved.
 *
 * 作者: 寒烟
 * 日期: 2018/5/30
 *
 * 个人博客：   http://www.cnblogs.com/ansiboy/
 * GITHUB:     http://github.com/ansiboy
 * QQ 讨论组：  119038574
 *
 * component.tsx 文件用于运行时加载，所以要控制此文件的大小，用于在运行时创建页面
 *
 ********************************************************************************/
declare type ReactFactory = (type: string | React.ComponentClass<any> | React.ComponentType, props: ComponentProps<any>, ...children: any[]) => JSX.Element;
export interface ComponentProps<T> extends React.Props<T> {
    id?: string;
    name?: string;
    className?: string;
    style?: React.CSSProperties;
    selected?: boolean;
    text?: string;
    parent_id?: string;
    attr?: ComponentAttribute;
}
declare type DesignerContextValue = {
    designer: PageDesigner | null;
};
export declare const DesignerContext: React.Context<DesignerContextValue>;
export declare const ComponentWrapperContext: React.Context<ComponentWrapper>;
export interface PropEditorInfo {
    propNames: string[];
    editorType: PropEditorConstructor;
    group: string;
}
export declare function component<T extends React.Component>(args?: ComponentAttribute): (constructor: new (...args: any[]) => T) => new (...args: any[]) => T;
export declare class Component {
    static readonly Fragment = "";
    private static defaultComponentAttribute;
    private static componentAttributes;
    /**
     * 设置组件特性
     * @param typename 组件类型名称
     * @param attr 组件特性
     */
    static setAttribute(typename: string, attr: ComponentAttribute): void;
    /**
     * 获取组件特性
     * @param typename 组件类型名称
     */
    static getAttribute(type: string | React.ComponentClass<any>): {
        type: string | React.ComponentClass<any, any>;
    } & ComponentAttribute;
    private static controlPropEditors;
    static getPropEditors(controlClassName: string): PropEditorInfo[];
    static getPropEditor<T, K extends keyof T, K1 extends keyof T[K]>(controlClassName: string, propName: K, propName1: K1): PropEditorInfo;
    static getPropEditor<T, K extends keyof T>(controlClassName: string, propName: string): PropEditorInfo;
    /** 通过属性数组获取属性的编辑器 */
    static getPropEditorByArray(controlClassName: string, propNames: string[]): PropEditorInfo;
    static setPropEditor(componentType: React.ComponentClass | string, propName: string, editorType: PropEditorConstructor, group?: string): void;
    /**
     * 将持久化的元素数据转换为 ReactElement
     * @param componentData 元素数据
     */
    static createElement(componentData: ComponentData, h?: ReactFactory): React.ReactElement<any> | null;
    private static componentTypes;
    static register(componentName: string, componentType: React.ComponentClass<any>, attr?: ComponentAttribute): void;
}
export declare const MasterPageName = "MasterPage";
export declare class MasterPage extends React.Component<ComponentProps<MasterPage>, {
    children: React.ReactElement<ComponentProps<MasterPage>>[];
}> {
    constructor(props: ComponentProps<MasterPage>);
    private children;
    componentWillReceiveProps(props: ComponentProps<MasterPage>): void;
    render(): JSX.Element;
}
/**
 * 占位符，用于放置控件
 */
export declare class PlaceHolder extends React.Component<{
    id: string;
    empty?: string | JSX.Element;
}, {}> {
    private element;
    constructor(props: any);
    private designer;
    wraper: ComponentWrapper;
    /**
     * 启用拖放操作，以便通过拖放图标添加控件
     */
    private enableAppendDroppable;
    private enableMoveDroppable;
    render(): JSX.Element;
}
export declare class PageView extends React.Component<{
    pageData: ComponentData;
}, {}> {
    constructor(props: any);
    render(): React.ReactElement<any>;
}
export {};