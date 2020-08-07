import React from "react";
import './Adjustment.css'
import {isGroupSelected, isHideInBreakpoint} from "../AwesomwGridLayoutHelper";
import AdjustmentHelpLines from "./AdjustmentHelpLines";

export default class AdjustmentHelpLinesWrapper extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            active: true
        };

        this.helpLineRef = React.createRef();
    }

    update = (item, helpLineParent, itemRect, dragging, fakeItemRect) => {
        this.setState({item, itemRect, dragging, fakeItemRect});
    };

    activate = (active) => {
        this.setState({active});
    };

    getRuntimeGridItemStyle = () => {
        if (this.helpLineRef.current)
            return this.helpLineRef.current.getRuntimeGridItemStyle();
    };

    render () {
        if (!this.state.active)
            return null;

        if (!this.state.item)
            return null;

        let {item, itemRect, dragging, fakeItemRect} = this.state;
        return (
            <>
                {
                    !item.state.showAnimation &&
                    !isHideInBreakpoint(item) &&
                    <AdjustmentHelpLines
                        ref={this.helpLineRef}
                        show={!item.props.helplineOff /*&& item.state.selected*/ &&
                        item.state.helpLinesParent && !item.getFromTempData("pageResize") &&
                        !isGroupSelected(item)}
                        helpLinesParent={item.state.helpLinesParent}
                        item={item}
                        dragging={dragging}
                        itemRect={itemRect}
                        fakeItemRect={fakeItemRect}
                        width={itemRect.width}
                        height={itemRect.height}
                    />
                }
            </>
        )
    }
}
