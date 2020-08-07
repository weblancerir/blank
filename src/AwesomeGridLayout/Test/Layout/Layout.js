import React from "react";
import './Layout.css';
import SortableTree from 'react-sortable-tree';
import FileExplorerTheme from "./Theme";
import IconButton from "../../HelperComponents/IconButton";
import {isHideInBreakpoint, showInBreakPoint} from "../../AwesomwGridLayoutHelper";
import Image from "../../Menus/CommonComponents/Image";

export default class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            percent: props.open ? 100 : 0,
            treeData: []
        };

        this.opening = false;
        this.closing = false;
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    open = () => {
        this.opening = true;
        clearInterval(this.closeInterval);
        clearInterval(this.openInterval);
        this.openInterval = setInterval(() => {
            if (!this.mounted) {
                clearInterval(this.openInterval);
                return;
            }
            let percent = this.state.percent += (this.props.speed * this.props.interval / 1000);
            if (percent > 100) {
                this.opening = false;
                clearInterval(this.openInterval);
            }
            percent = Math.min(100, percent);
            this.setState({percent, open: (percent === 100)});
        }, this.props.interval);
    };

    close = () => {
        this.closing = true;
        clearInterval(this.closeInterval);
        clearInterval(this.openInterval);
        this.closeInterval = setInterval(() => {
            if (!this.mounted) {
                clearInterval(this.closeInterval);
                return;
            }
            let percent = this.state.percent -= (this.props.speed * this.props.interval / 1000);
            if (percent < 0) {
                this.closing = false;
                clearInterval(this.closeInterval);
            }
            percent = Math.max(0, percent);
            this.setState({percent, open: (percent !== 0)});
        }, this.props.interval);
    };

    setLayout = (layout) => {
        this.processLayout(layout)
    };

    processLayout = (layout) => {
        if (!layout)
            return;

        let {idMan} = this.props;

        let getTreeItem = (layoutItem) => {
            let item = idMan.getItem(layoutItem.childData.props.id);
            return {
                title: layoutItem.childData.tagName,
                layoutItem: layoutItem,
                children: layoutItem.childrenData.map(childLayout => {
                    return getTreeItem(childLayout);
                }),
                expanded: item.getFromTempData("layoutTreeExpanded"),
                parentItemId: item.props.parent && item.props.parent.props.id
            };
        };

        this.setState({
            treeData: [getTreeItem(layout[0])]
        });
    };

    setTree = (treeData) => {
        let {idMan} = this.props;
        let updateItem = (treeItem) => {
            let item = idMan.getItem(treeItem.layoutItem.childData.props.id);
            item.setTempData("layoutTreeExpanded", treeItem.expanded);
            treeItem.children.forEach((childTreeItem, index) => {
                item.setChildZIndex(childTreeItem.layoutItem.childData.props.id, index + 1);
            });
            item.updateLayout();
            treeItem.children.map(childTreeItem => {
                updateItem(childTreeItem);
            });
        };

        updateItem(treeData[0]);

        this.setState({treeData});
    };

    render() {
        let {idMan} = this.props;
        return (
            <>
                <div
                    className="LayoutRoot"
                    style={{
                        left: `${this.state.percent - 100}%`,
                        opacity: this.state.percent / 100
                    }}
                    onContextMenu={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >
                    <div
                        className="LayoutTreeRootHeader"
                    >
                        {/*Header*/}
                        <div
                            className="LayoutTreeRootHeaderContainer"
                        >
                            <span className="LayoutTreeRootHeaderTitle">
                                Layers
                            </span>

                            <IconButton
                                onClick={this.close}
                            >
                                <img
                                    draggable={false}
                                    width={12}
                                    height={12}
                                    src={require('../../icons/close.svg')}
                                />
                            </IconButton>
                        </div>
                    </div>

                    <div
                        className="LayoutTreeRoot"
                    >
                        <SortableTree
                            className="LayoutSortableTree"
                            theme={FileExplorerTheme}
                            treeData={this.state.treeData}
                            onChange={treeData => this.setTree(treeData)}
                            innerStyle={{
                                outline: 'none',
                            }}
                            generateNodeProps={rowInfo => {
                                let layoutItem = rowInfo.node.layoutItem; // {tagName, childData, childrenData}
                                let item = idMan.getItem(layoutItem.childData.props.id);
                                let rowWrapperStyle = {};
                                if (item.state.selected)
                                    rowWrapperStyle.backgroundColor = "#e4ffea";

                                let buttons = [
                                    <IconButton
                                        key={"rightClick"}
                                        onClick={(e) => {
                                            item.onContextMenu(e);
                                        }}
                                        imageContainerStyle={{
                                            padding: 4
                                        }}
                                    >
                                        <img
                                            draggable={false}
                                            width={16}
                                            height={16}
                                            src={'static/icon/more-black.svg'}
                                        />
                                    </IconButton>
                                ];
                                if (isHideInBreakpoint(item)) {
                                    buttons.unshift(
                                        <IconButton
                                            key={"hidedInBp"}
                                            onClick={(e) => {
                                                showInBreakPoint(item);
                                            }}
                                            imageContainerStyle={{
                                                padding: 4
                                            }}
                                        >
                                            <img
                                                draggable={false}
                                                width={16}
                                                height={16}
                                                src={'static/icon/hide.svg'}
                                            />
                                        </IconButton>
                                    )
                                }

                                return ({
                                    rowWrapperStyle: rowWrapperStyle,
                                    onClick: (e) => {
                                        let eClass = e.target.getAttribute("class");
                                        if (eClass !== "expandButton" && eClass !== "collapseButton")
                                            item.onSelect(true, undefined, undefined, true);
                                    },
                                    icons: [
                                        <Image
                                            draggable={false}
                                            width={16}
                                            height={16}
                                            src={item.props.favIconUrl}
                                            style={{
                                                marginTop: 2
                                            }}
                                            errorsrc={'/static/icon/rectangle.svg'}
                                        />
                                    ],
                                    buttons: buttons,
                                })
                            }}
                            canDrag={({ node, path, treeIndex, lowerSiblingCounts, isSearchMatch,
                                          isSearchFocus}) => {
                                let item = idMan.getItem(node.layoutItem.childData.props.id);
                                return !item.props.isPage && !item.props.isSection;
                            }}
                            canDrop={({ node, nextParent, prevPath, nextPath }) => {
                                return !!(nextParent && node.parentItemId === nextParent.layoutItem.childData.props.id);
                            }}
                        />
                    </div>

                </div>
            </>
        )
    }
}

Layout.defaultProps = {
    open: false,
    speed: 400,
    interval: 5
};
