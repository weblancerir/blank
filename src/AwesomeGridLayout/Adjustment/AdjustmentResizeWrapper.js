import React from "react";
import './Adjustment.css'
import ResizePane from "./ResizePane";
import AdjustmentStretch from "./AdjustmentStretch";
import {cloneObject, shallowEqual} from "../AwesomeGridLayoutUtils";
import Popper from "@material-ui/core/Popper/Popper";
import Portal from "../Portal";
import AdjustmentResizePage from "./AdjustmentResizePage";
import {allowStretch, isGroupSelected, isHideInBreakpoint, isStretch} from "../AwesomwGridLayoutHelper";
import AdjustmentResize from "./AdjustmentResize";

export default class AdjustmentResizeWrapper extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            active: true
        };
    }

    update = (item, data, transformStyleId) => {
        this.setState({item, data, transformStyleId});
    };

    activate = (active) => {
        this.setState({active});
    };

    render () {
        if (!this.state.active)
            return null;

        if (!this.state.item)
            return null;

        let {item, data} = this.state;

        return (
            <>
                {
                    item.getFromTempData("resizable") &&
                    !item.state.showAnimation &&
                    !isGroupSelected(item) &&
                    !isHideInBreakpoint(item) &&
                    <AdjustmentResize
                        id={item.props.id}
                        key={`resize`}
                        sides={item.props.resizeSides || ['n','s','e','w','ne','nw','se','sw']}
                        onResizeStart={item.onResizeStart}
                        onResize={item.onResize}
                        onResizeStop={item.onResizeStop}
                        draggingStart={item.state.draggingStart}
                        isStretch={isStretch(item)}
                        allowStretch={allowStretch(item)}
                        itemId={item.props.id}
                        item={item}
                        idMan={item.props.idMan}
                        transformStyleId={this.state.transformStyleId}
                        data={data}
                    />
                }
            </>
        )
    }
}
