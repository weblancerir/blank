import React from "react";
import {appendStyle, cloneObject, shallowEqual, updateStyle} from "./AwesomeGridLayoutUtils";
import './GridChildDraggable.css';
import GridChildContainerChildren from "./GridChildContainerChildren";
import classNames from "classnames";
import AdjustmentPageControllers from "./Adjustment/AdjustmentPageControllers";
import GridChildContainerFixedHolder from "./GridChildContainerFixedHolder";

export default class GridChildContainer extends React.Component {
    constructor(props) {
        super(props);
        this.controllerRef = React.createRef();
        this.fixedHolderRef = React.createRef();
    }

    componentDidMount() {
        this.modifyOverflowStyle(this.props.overflowData, this.props.aglStyle);
        this.modifyContainerStyle(this.props.grid, this.props.aglStyle);
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (!shallowEqual(this.allChildId, Object.keys(nextProps.allChildren)) ||
            !shallowEqual(this.grid, nextProps.grid) ||
            !shallowEqual(this.size, nextProps.size) ||
            !shallowEqual(this.allChildIndex.toString(),
                Object.values(nextProps.allChildren).map(c => c.zIndex)).toString()
        ) {
            if (!shallowEqual(this.overflowData, nextProps.overflowData))
                this.modifyOverflowStyle(nextProps.overflowData, nextProps.aglStyle);

            if (!shallowEqual(this.grid, nextProps.grid))
                this.modifyContainerStyle(nextProps.grid, nextProps.aglStyle);

            if (!shallowEqual(this.aglStyle, nextProps.aglStyle)) {
                this.modifyOverflowStyle(nextProps.overflowData, nextProps.aglStyle);
                this.modifyContainerStyle(nextProps.grid, nextProps.aglStyle);
            }

            return true;
        }

        if (!shallowEqual(this.overflowData, nextProps.overflowData)) {
            this.modifyOverflowStyle();
        }
        if (!shallowEqual(this.aglStyle, nextProps.aglStyle)) {
            this.modifyOverflowStyle(nextProps.overflowData, nextProps.aglStyle);
            this.modifyContainerStyle(nextProps.grid, nextProps.aglStyle);
        }

        return false;
    }

    saveState = () => {
        let {allChildren, grid, overflowData, aglStyle, size} = this.props;
        this.allChildId = Object.keys(allChildren);
        this.allChildIndex = Object.values(allChildren).map(c => c.zIndex);
        this.grid = cloneObject(grid);
        this.overflowData = cloneObject(overflowData);
        this.aglStyle = cloneObject(aglStyle);
        this.size = cloneObject(size);
    };

    modifyContainerStyle = (grid, aglStyle) => {
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
            gridTemplateRows: grid.gridTemplateRows,
            gridTemplateColumns: grid.gridTemplateColumns,
        };

        let styleNode = document.getElementById(this.getContainerStyleId());

        if (!styleNode) {
            appendStyle(style, this.getContainerStyleId(), this.getContainerStyleId(), this.props.agl);
        } else {
            updateStyle(styleNode, style, this.getContainerStyleId());
        }
    };

    modifyOverflowStyle = (overflowData, aglStyle) => {
        let styleNode = document.getElementById(this.getOverflowStyleId());

        if (!styleNode) {
            appendStyle(this.getOverflowStyle(overflowData, aglStyle), this.getOverflowStyleId()
                , this.getOverflowStyleId(), this.props.agl);
        } else {
            updateStyle(styleNode, this.getOverflowStyle(overflowData, aglStyle), this.getOverflowStyleId());
        }
    };

    getOverflowStyle = (overflowData, aglStyle) => {
        console.log("getOverflowStyle", overflowData.state, this.props.id);
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
            style.width = "auto";
            delete style.left;
            delete style.right;
        }

        if (aglStyle && aglStyle.height === "auto") {
            style.position = "relative";
            style.height = "auto";
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
            switch (overflowData.scroll) {
                case 'vertical':
                    style.overflowX = "hidden";
                    style.overflowY = overflowData.auto || "scroll";
                    break;
                case 'horizontal':
                    style.overflowX = overflowData.auto || "scroll";
                    style.overflowY = "hidden";
                    break;
                case 'both':
                    style.overflowX = overflowData.auto || "scroll";
                    style.overflowY = overflowData.auto || "scroll";
                    break;
                default:
                    break;
            }

            return style;
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
        this.controllerRef.current.forceUpdate();
        this.fixedHolderRef.current.forceUpdate();
    };

    render () {
        if (!this.props.show)
            return null;
        this.saveState();
        let {allChildren, id, grid, isPage, page, size, getChildrenOverride, agl} = this.props;

        let overflowClasses = classNames(
            this.getOverflowStyleId()
        );
        let containerClasses = classNames(
            this.getContainerStyleId()
        );

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
                    <GridChildContainerChildren
                        allChildren={allChildren}
                        getChildrenOverride={getChildrenOverride}
                        agl={agl}
                    />

                    {
                        isPage &&
                        <AdjustmentPageControllers
                            grid={grid}
                            page={page}
                            ref={this.controllerRef}
                            document={this.props.document}
                        />
                    }

                    {
                        isPage &&
                        <GridChildContainerFixedHolder
                            ref={this.fixedHolderRef}
                            size={size}
                            id={id}
                        />
                    }
                </div>
            </div>
        )
    }
}
