import React from "react";
import './PreviewHeaderBreakpoints.css';
import {EditorContext} from "../EditorContext";
import NumberInputEnterToChange from "../../Menus/CommonComponents/NumberInputEnterToChange";
import {getBreakpointIcon, getBreakpointName} from "./BreakpointHelper";
import DropDown from "../../Menus/CommonComponents/DropDown";

export default class PreviewHeaderBreakpoints extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lastBpData: undefined
        };
    }

    componentDidMount () {
        this.mounted = true;
    }

    componentWillUnmount () {
        this.mounted = false;
    }

    getCurrentValue = (editorContext) => {
        if (!editorContext.editor.rootLayoutRef.current)
            return "...";

        let width = editorContext.editor.rootLayoutRef.current.getSize(false).width;

        let bpData = this.getOptions(editorContext).filter(bpData => {
            console.log("getCurrentValue", bpData.name, bpData.type, bpData.start, width, bpData.type === 'device' && bpData.start === width)
            return bpData.type === 'device' && bpData.start === width;
        })[0];

        if (bpData) {
            return (this.state.lastBpData && this.state.lastBpData.type === "device" && this.state.lastBpData) || bpData;
        }

        return editorContext.editor.breakpointmanager.currentBpData(width);
    };

    getOptions = (editorContext) => {
        let options = [{
            title: "Page Breakpoints", disabled:true
        }];

        if (!editorContext.editor.breakpointmanager) return [];

        let breakpoints = editorContext.editor.breakpointmanager.getSortedBreakPoints().reverse();

        breakpoints.forEach(bpData => {
            options.push(bpData);
        });

        options.push({
            title: "Common Devices", disabled:true
        });

        (this.props.devices || []).sort((a, b) => {
            if (a.start > b.start) {
                return -1;
            } else if (a.start === b.start) {
                // Without this, we can get different sort results in IE vs. Chrome/FF
                return 0;
            }
            return 1;
        }).forEach(bpData => {
            bpData.type = 'device';
            options.push(bpData);
        });

        return options;
    }

    render () {
        return (
            <EditorContext.Consumer>
                {editorContext => (
                    <div
                        {...this.props}
                    >
                        <DropDown
                            options={editorContext.siteData ? this.getOptions(editorContext) : ["..."]}
                            onChange={(bpData) => {
                                this.setState({lastBpData: bpData});
                                editorContext.setPageSizeWidth(bpData.prefer || bpData.start);
                            }}
                            value={editorContext.pageData ? this.getCurrentValue(editorContext) : "..."}
                            spanStyle={{
                                width: 256,
                                fontSize: 14,
                                border: "0px solid #cfcfcf",
                            }}
                            renderer={(bpData) => {
                                return (
                                    <div className="PreviewHeaderBreakpointsRenderer">
                                        {
                                            bpData.name &&
                                            <div className="PreviewHeaderBreakpointsRendererIcon">
                                                {
                                                    getBreakpointIcon(bpData)
                                                }
                                            </div>
                                        }
                                        {
                                            bpData.name &&
                                            <div className="PreviewHeaderBreakpointsRendererName">
                                                {
                                                    bpData.type === 'device' ? bpData.name :
                                                    getBreakpointName(bpData)
                                                }
                                            </div>
                                        }
                                        {
                                            bpData.name &&
                                            <div className="PreviewHeaderBreakpointsRendererSize">
                                                {
                                                    bpData.start + " px"
                                                }
                                            </div>
                                        }
                                        {
                                            !bpData.name &&
                                            <div className="PreviewHeaderBreakpointsRendererTitle">
                                                {
                                                    bpData.title
                                                }
                                            </div>
                                        }
                                    </div>
                                )
                            }}
                            valueRenderer={(bpData) => {
                                return (
                                    <div className="PreviewHeaderBreakpointsRenderer">
                                        {
                                            bpData.name &&
                                            <div className="PreviewHeaderBreakpointsRendererIcon">
                                                {
                                                    getBreakpointIcon(bpData)
                                                }
                                            </div>
                                        }
                                        {
                                            bpData.name &&
                                            <div className="PreviewHeaderBreakpointsRendererName">
                                                {
                                                    bpData.type === 'device' ? bpData.name :
                                                    getBreakpointName(bpData)
                                                }
                                            </div>
                                        }
                                        {
                                            !bpData.name &&
                                            <div className="PreviewHeaderBreakpointsRendererTitle">
                                                {
                                                    bpData.title
                                                }
                                            </div>
                                        }
                                    </div>
                                )
                            }}
                        />

                        <div style={{
                            backgroundColor: "#cfcfcf",
                            height: "auto",
                            width: 1,
                            marginLeft: 10
                        }}>

                        </div>

                        {
                            editorContext.editor && editorContext.editor.rootLayoutRef.current &&
                            <>
                                <span
                                    style={{
                                        marginLeft: 10,
                                        display:"flex",
                                        alignItems: "center",
                                        fontSize: 12
                                    }}
                                >
                                    Width
                                </span>
                                <NumberInputEnterToChange
                                    inputStyle={{
                                        marginLeft: 10
                                    }}
                                    min={editorContext.editor.breakpointmanager.getMinWidth()}
                                    max={9999}
                                    value={editorContext.editor.rootLayoutRef.current.getSize(false).width}
                                    onChange={(width) => {
                                        editorContext.setPageSizeWidth(width);
                                    }}
                                />
                            </>
                        }
                    </div>
                )}
            </EditorContext.Consumer>
        )
    }
}
