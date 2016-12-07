import React, { Component } from "react";
import * as Immutable from "immutable";
import { DragDropContext, Backend as DragDropBackend } from "react-dnd";
import TouchDragDropBackend from "react-dnd-touch-backend";
import { TreeView } from "react-dnd-treeview";

import styles from "../../../Styles/listview.css";

export class ListView extends Component {
    constructor() {
        super();
        this.state = {
            rootNodes: {
                items: Immutable.List([
                    {
                        id: "A",
                        title: "Item A",
                        children: {
                            items: Immutable.List([
                                {
                                    id: "A1",
                                    title: "Item A1",
                                },
                                {
                                    id: "A2",
                                    title: "Item A2",
                                },
                                {
                                    id: "A3",
                                    title: "Item A3",
                                },
                            ]),
                        },
                    },
                    {
                        id: "B",
                        title: "B",
                        children: {
                            items: Immutable.List([
                                {
                                    id: "B1",
                                    title: "Item B1",
                                },
                                {
                                    id: "B2",
                                    title: "Item B2",
                                },
                            ]),
                        },
                    },
                    {
                        id: "C",
                        title: "C",
                        children: {
                            items: Immutable.List([
                                {
                                    id: "C1",
                                    title: "Item C1",
                                    children: {
                                        items: Immutable.List([
                                            {
                                                id: "C1x",
                                                title: "Item C1x",
                                            },
                                            {
                                                id: "C1y",
                                                title: "Item C1y",
                                            },
                                            {
                                                id: "C1z",
                                                title: "Item C1z",
                                            },
                                            {
                                                id: "C1zz",
                                                title: "Item C1zz",
                                            },
                                            {
                                                id: "C1zzz",
                                                title: "Item C1zzz",
                                            },
                                        ]),
                                    },
                                },
                            ]),
                        },
                    },
                ]),
            },
        };
    }


    recursivelyUpdateNode(node,
                          listUpdateFunc,
                          nodeUpdateFunc) {
        var me = this;
        const children = node.children ? node.children : {items: Immutable.List()};
        const updateChildren = me.recursivelyUpdateList(children, node, listUpdateFunc, nodeUpdateFunc);
        if (updateChildren !== node.children) {
            node = Object.assign({}, node, {
                children: updateChildren,
            });
        }
        return nodeUpdateFunc(node);
    }

    recursivelyUpdateList(list,
                          parentNode,
                          listUpdateFunc,
                          nodeUpdateFunc) {
        var me = this;
        const mappedItems = list.items.map(item => me.recursivelyUpdateNode(item, listUpdateFunc, nodeUpdateFunc));
        if (!Immutable.is(mappedItems, list.items)) {
            list = Object.assign({}, list, {
                items: mappedItems,
            });
        }
        return listUpdateFunc(list, parentNode);
    }

    handleMoveNode = (args) => {
        var me = this;
        this.setState(Object.assign({}, this.state, {
            rootNodes: me.recursivelyUpdateList(
                this.state.rootNodes,
                null,
                (list, parentNode) =>
                    parentNode === args.newParentNode && parentNode === args.oldParentNode
                        ? Object.assign({}, list, {
                        items: list.items
                            .insert(args.newParentChildIndex, args.node)
                            .remove(args.oldParentChildIndex + (args.newParentChildIndex < args.oldParentChildIndex ? 1 : 0))
                    })
                        : parentNode === args.newParentNode
                        ? Object.assign({}, list, {
                        items: list.items.insert(args.newParentChildIndex, args.node)
                    })
                        : parentNode === args.oldParentNode
                        ? Object.assign({}, list, {
                        items: list.items.remove(args.oldParentChildIndex)
                    })
                        : list,
                item => item
            ),
        }));
    };

    setStateWithLog = (newState) => {
        console.log("new state: ", newState);
        this.setState(newState);
    };

    handleToggleCollapse = (node) => {
        var me = this;
        this.setStateWithLog(Object.assign({}, this.state, {
            rootNodes: me.recursivelyUpdateList(
                this.state.rootNodes,
                null,
                (list, parentNode) => list,
                item => item === node ? Object.assign({}, item, {
                    isCollapsed: !item.isCollapsed,
                }) : item
            ),
        }));
    };

    renderNode = (node) => (
        <div className={ styles.nodeItem }>
            { !node.children || node.children.items.isEmpty()
                ? null
                : <a
                style={{ fontSize: "16px", verticalAlign: "middle", color:"#888", paddingRight:"5px" }}
                onClick={ () => this.handleToggleCollapse(node) }
            >
                {node.isCollapsed ? "+" : "-"}
            </a>
            }
            {this.props.renderNode ? this.props.renderNode(node) : "Node: " + node.title}
        </div>
    );

    render() {
        return (
            <TreeView
                rootNodes={ this.state.rootNodes }
                classNames={ styles }
                renderNode={ this.renderNode.bind(this) }
                onMoveNode={ this.handleMoveNode.bind(this) }
            />
        );
    }
}

export const DraggableListView = DragDropContext(
    TouchDragDropBackend
)(ListView);