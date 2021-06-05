import AwesomeGridLayout2 from "../../AwesomeGridLayout2";
import React from "react";
import {assignData, initGriddata} from "../../AwesomeGridLayoutUtils";

export default class AGLWrapper extends React.Component{
    render() {
        let griddata = this.props.aglRef.current && this.props.aglRef.current.props.griddata;
        if (!griddata) griddata = this.props.griddata;
        console.log("griddata.customStyle1", this.props.griddata.customStyle)
        console.log("griddata.customStyle2", griddata.customStyle)
        if (griddata && griddata.initialized) {
            console.log("griddata.customStyle3", griddata.customStyle)
            if (!griddata.filDataOnMount) {
                console.log("griddata.customStyle4", griddata.customStyle)
                griddata.filDataOnMount = true;
                // griddata.fillWithData = true;
                let bpData = this.props.data.bpData;
                Object.keys(this.props.data).forEach(key => {
                    if (key !== "bpData") {
                        console.log("key", key)
                        griddata[key] = this.props.data[key];
                    }
                });
                assignData(griddata.bpData["laptop"], bpData);
                console.log("griddata.customStyle5", griddata.customStyle)
            }
        } else {
            console.log("griddata.customStyle6", griddata.customStyle)
            griddata = assignData(this.props.griddata, this.props.data);
            console.log("griddata.customStyle7", griddata.customStyle)
            initGriddata(griddata, this.props.breakpointmanager);
            console.log("griddata.customStyle8", griddata.customStyle)
        }

        console.log("griddata", griddata)

        return (
            <AwesomeGridLayout2
                className={this.props.className}
                {...this.props}
                ref={this.props.aglRef}
                griddata={griddata}
            />
        )
    }
}
