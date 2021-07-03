import React from "react";
import {appendStyle, cloneObject, shallowEqual, updateStyle} from "./AwesomeGridLayoutUtils";
import './GridChildDraggable.css';
import GridChildContainerChildren from "./GridChildContainerChildren";
import classNames from "classnames";
import AdjustmentPageControllers from "./Adjustment/AdjustmentPageControllers";
import GridChildContainerFixedHolder from "./GridChildContainerFixedHolder";
import PaddingInterface from "./Test/PaddingInterface";
import ParentSelectInterface from "./Test/ParentSelectInterface";
import {EditorContext} from "./Editor/EditorContext";

export default class GridChildContainer extends React.Component {
    static contextType = EditorContext;
    constructor(props) {
        super(props);
        this.controllerRef = React.createRef();
        this.fixedHolderRef = React.createRef();
    }

    componentDidMount() {
        this.modifyOverflowStyle(this.props.overflowData, this.props.aglStyle);
        this.modifyContainerStyle(this.props.grid, this.props.aglStyle, this.props.padding);
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (!shallowEqual(this.allChildId, Object.keys(nextProps.allChildren)) ||
            !shallowEqual(this.grid, nextProps.grid) ||
            !shallowEqual(this.size, nextProps.size) ||
            this.props.selectAsParent !== nextProps.selectAsParent ||
            this.props.selected !== nextProps.selected ||
            !shallowEqual(this.padding, nextProps.padding) ||
            !shallowEqual(JSON.stringify(this.allChildIndex),
                JSON.stringify(Object.values(nextProps.allChildren).map(c => {
                    return {
                        z: c.zIndex,
                        i: c.child.props.id
                    }
                })))
        ) {
            if (!shallowEqual(this.overflowData, nextProps.overflowData))
                this.modifyOverflowStyle(nextProps.overflowData, nextProps.aglStyle);

            if (!shallowEqual(this.grid, nextProps.grid) || !shallowEqual(this.padding, nextProps.padding))
                this.modifyContainerStyle(nextProps.grid, nextProps.aglStyle, nextProps.padding);

            if (!shallowEqual(this.aglStyle, nextProps.aglStyle)) {
                this.modifyOverflowStyle(nextProps.overflowData, nextProps.aglStyle);
                this.modifyContainerStyle(nextProps.grid, nextProps.aglStyle, nextProps.padding);
            }

            return true;
        }

        if (!shallowEqual(this.overflowData, nextProps.overflowData)) {
            this.modifyOverflowStyle(nextProps.overflowData, nextProps.aglStyle);
            return true;
        }
        if (!shallowEqual(this.aglStyle, nextProps.aglStyle)) {
            this.modifyOverflowStyle(nextProps.overflowData, nextProps.aglStyle);
            this.modifyContainerStyle(nextProps.grid, nextProps.aglStyle, nextProps.padding);
            return true;
        }

        return false;
    }

    saveState = () => {
        let {allChildren, grid, overflowData, aglStyle, size, padding} = this.props;
        this.allChildId = Object.keys(allChildren);
        this.allChildIndex = Object.values(allChildren).map(c => {
            return {
                z: c.zIndex,
                i: c.child.props.id
            }
        });
        this.grid = cloneObject(grid);
        this.overflowData = cloneObject(overflowData);
        this.aglStyle = cloneObject(aglStyle);
        this.size = cloneObject(size);
        this.padding = cloneObject(padding);
    };

    modifyContainerStyle = (grid, aglStyle, padding) => {
        if (!grid)
            grid = this.props.grid;

        let {modifyContainerStyleOverride, agl} = this.props;

        if (modifyContainerStyleOverride){
            modifyContainerStyleOverride(this, agl, grid, aglStyle);
            return;
        }

        let style = {
            width: (aglStyle && aglStyle.width === "auto") ? "auto": "100%",
            height: (aglStyle && aglStyle.height === "auto") ? "auto":
                agl.getFromData("containerHeight") || "100%",
            display: "grid",
            position: "relative",
            boxSizing: "border-box",
            gridTemplateRows: grid.gridTemplateRows,
            gridTemplateColumns: grid.gridTemplateColumns,
        };

        if (padding) {
            if (padding.top) style.paddingTop = padding.top;
            if (padding.left) style.paddingLeft = padding.left;
            if (padding.bottom) style.paddingBottom = padding.bottom;
            if (padding.right) style.paddingRight = padding.right;

            /*style.backgroundImage = "";
            Object.keys(padding).forEach(key => {
                if (key === "top")
                    style.backgroundImage += `linear-gradient(to bottom, #00f3ffa8 ${padding.top}, transparent 10px),`
                if (key === "bottom")
                    style.backgroundImage += `linear-gradient(to top, #00f3ffa8 ${padding.bottom}, transparent 10px),`
                if (key === "left")
                    style.backgroundImage += `linear-gradient(to right, #00f3ffa8 ${padding.left}, transparent 10px),`
                if (key === "right")
                    style.backgroundImage += `linear-gradient(to left, #00f3ffa8 ${padding.right}, transparent 10px),`
            });

            if (style.backgroundImage)
                style.backgroundImage = style.backgroundImage.slice(0, -1);*/
        }

        let styleNode = document.getElementById(this.getContainerStyleId());

        if (!styleNode) {
            appendStyle(style, this.getContainerStyleId(), this.getContainerStyleId());
        } else {
            updateStyle(styleNode, style, this.getContainerStyleId());
        }
    };

    modifyOverflowStyle = (overflowData, aglStyle) => {
        let styleNode = document.getElementById(this.getOverflowStyleId());

        if (!styleNode) {
            appendStyle(this.getOverflowStyle(overflowData, aglStyle), this.getOverflowStyleId()
                , this.getOverflowStyleId());
        } else {
            updateStyle(styleNode, this.getOverflowStyle(overflowData, aglStyle), this.getOverflowStyleId());
        }

        let webkitScrollbarStyle = {};
        let webkitScrollbarStyleId = this.getOverflowStyleId() + '::-webkit-scrollbar';
        if (overflowData.auto === 'hide') webkitScrollbarStyle.display = "none";

        let scrollStyleNode = document.getElementById(webkitScrollbarStyleId);

        if (!scrollStyleNode) {
            appendStyle(webkitScrollbarStyle, webkitScrollbarStyleId, webkitScrollbarStyleId);
        } else {
            updateStyle(scrollStyleNode, webkitScrollbarStyle, webkitScrollbarStyleId);
        }
    };

    getOverflowStyle = (overflowData, aglStyle) => {
        let style = {
            display: "grid",
            gridTemplateRows: "1fr",
            gridTemplateColumns: "1fr",
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        };

        if (aglStyle && aglStyle.width === "auto") {
            style.position = "relative";
            delete style.left;
            delete style.right;
            delete style.top;
            delete style.bottom;
        }

        if (aglStyle && aglStyle.height === "auto") {
            style.position = "relative";
            delete style.left;
            delete style.right;
            delete style.top;
            delete style.bottom;
        }


        if (!overflowData)
            overflowData = this.props.overflowData;

        if (!overflowData)
            return style;

        if (overflowData.state === 'show') {
            return style;
        }

        if (overflowData.state === 'hide') {
            style.overflowX = "hidden";
            style.overflowY = "hidden";
            return style;
        }

        if (overflowData.state === 'scroll') {
            style.overflowX = overflowData.overflowX? overflowData.auto === 'auto'? "auto" : "scroll" : "hidden" ;
            style.overflowY = overflowData.overflowY? overflowData.auto === 'auto'? "auto" : "scroll" : "hidden" ;
        }

        if (overflowData.auto === 'hide') {
            // TODO hide scrollbar with webkit
            style.scrollbarWidth = 'none';
            style.overflow = '-moz-scrollbars-none';
            style['-ms-overflow-style'] = 'none';
        }

        return style;
    };

    getOverflowStyleId = () => {
        return `style_overflow_${this.props.id}`
    };

    getContainerStyleId = () => {
        return `style_container_${this.props.id}`
    };

    updateAdjustments = () => {
        this.controllerRef.current && this.controllerRef.current.forceUpdate();
        this.fixedHolderRef.current && this.fixedHolderRef.current.forceUpdate();
    };

    needOverflow = () => {
        let overflowData = this.props.overflowData;

        if (overflowData.state !== 'scroll')
            return false;

        if (overflowData.overflowX === 'scroll')
                return true;
        if (overflowData.overflowY === 'scroll')
                return true;

        return false;
    };

    render () {
        if (!this.props.show)
            return null;
        this.saveState();
        let {allChildren, id, grid, isPage, page, size, getChildrenOverride, agl, editor} = this.props;

        let overflowClasses = classNames(
            this.getOverflowStyleId()
        );
        let containerClasses = classNames(
            this.getContainerStyleId()
        );

        if (!isPage) {
            if (this.needOverflow()) {
                return (
                    <div
                        id={`${id}_overflow`}
                        className={overflowClasses}
                        ref={this.props.overflowRef}
                        onScroll={this.props.onScroll}
                    >
                        <div
                            id={`${id}_container`}
                            className={containerClasses}
                            ref={this.props.containerRef}
                        >
                            {
                                this.props.padding && (this.props.selectAsParent || this.props.selected) &&
                                <PaddingInterface padding={this.props.padding} />
                            }
                            {
                                this.props.selectAsParent &&
                                <ParentSelectInterface />
                            }
                            <GridChildContainerChildren
                                allChildren={allChildren}
                                getChildrenOverride={getChildrenOverride}
                                agl={agl}
                            />
                        </div>
                    </div>
                )
            } else {
                return (
                    <div
                        id={`${id}_container`}
                        className={containerClasses}
                        ref={this.props.containerRef}
                    >
                        {
                            this.props.padding && (this.props.selectAsParent || this.props.selected) &&
                            <PaddingInterface padding={this.props.padding} />
                        }
                        {
                            this.props.selectAsParent &&
                            <ParentSelectInterface />
                        }
                        <GridChildContainerChildren
                            allChildren={allChildren}
                            getChildrenOverride={getChildrenOverride}
                            agl={agl}
                        />
                    </div>
                )
            }
        } else {
            return (
                    <div
                        id={`${id}_container`}
                        className={containerClasses}
                        ref={this.props.containerRef}
                    >
                        {
                            this.props.padding && (this.props.selectAsParent || this.props.selected) &&
                            <PaddingInterface padding={this.props.padding} />
                        }
                        {
                            this.props.selectAsParent &&
                            <ParentSelectInterface />
                        }
                        <GridChildContainerChildren
                            allChildren={allChildren}
                            getChildrenOverride={getChildrenOverride}
                            agl={agl}
                        />

                        {
                            editor && !this.context.production &&
                            <AdjustmentPageControllers
                                grid={grid}
                                page={page}
                                editor={editor}
                                ref={this.controllerRef}
                            />
                        }

                        <GridChildContainerFixedHolder
                            ref={this.fixedHolderRef}
                            size={size}
                            id={id}
                        />
                    </div>
            )
        }
    }
}
