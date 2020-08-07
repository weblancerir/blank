import AwesomeGridLayout2 from "../../AwesomeGridLayout2";
import React from "react";
import {assignData, cloneObject, initGriddata} from "../../AwesomeGridLayoutUtils";

export default class AGLWrapper extends React.Component{
    render() {
        let griddata = this.props.aglRef.current && this.props.aglRef.current.props.griddata;
        if (!griddata) griddata = this.props.griddata;
        if (griddata && griddata.initialized) {
            if (!griddata.fillWithData) {
                griddata.fillWithData = true;
                let bpData = this.props.data.bpData;
                Object.keys(this.props.data).forEach(key => {
                    if (key !== "bpData") {
                        griddata[key] = this.props.data[key];
                    }
                });
                assignData(griddata.bpData["laptop"], bpData);
            }
        } else {
            griddata = assignData(this.props.griddata, this.props.data);
            initGriddata(griddata, this.props.breakpointmanager);
        }

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
