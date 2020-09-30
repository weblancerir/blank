import React from "react";
import './EditorHeaderBreakpointsSetting.css';
import {EditorContext} from "../EditorContext";
import Menu from "@material-ui/core/Menu";
import IconButton from "../../HelperComponents/IconButton";
import EditorHeaderBreakpointsSettingItem from "./EditorHeaderBreakpointsSettingItem";
import {Button} from "@material-ui/core";

export default class EditorHeaderBreakpointsSetting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount () {
        this.mounted = true;
    }

    componentWillUnmount () {
        this.mounted = false;
    }

    clearEditMode = () => {
        console.log("clearEditMode")
        Object.values(this.bpItemrRefs).forEach(bpItemRef => {
            console.log("clearEditMode1", bpItemRef)
            if (bpItemRef.current)
                bpItemRef.current.cancelEditMode();
        });
    };

    getBpItemRef = (name) => {
        if (!this.bpItemrRefs)
            this.bpItemrRefs = {};

        if (!this.bpItemrRefs[name])
            this.bpItemrRefs[name] = React.createRef();

        return this.bpItemrRefs[name];
    }

    render () {
        return (
            <EditorContext.Consumer>
                {editorContext => (
                    <Menu
                        style={{
                            zIndex: 99999999999
                        }}
                        anchorEl={this.props.anchorEl}
                        open={true}
                        onClose={(e) => {
                            this.props.onClose();
                        }}
                        MenuListProps={{
                            style: {
                                padding: 0
                            }
                        }}
                    >
                        <div className="BpSettingRoot">
                            {/*Header*/}
                            <div className="BpSettingHeader">
                                <div
                                    className="BpSettingHeaderContainer"
                                >
                            <span className="BpSettingHeaderTitle">
                                Customize Breakpoints
                            </span>

                                    <IconButton
                                        onClick={this.props.onClose}
                                    >
                                        <img
                                            draggable={false}
                                            width={12}
                                            height={12}
                                            src={process.env.PUBLIC_URL + '/static/icon/close.svg'}
                                        />
                                    </IconButton>
                                </div>
                            </div>

                            <p className="BpSettingGuideSpan">
                                Add, edit or delete this page's breakpoints to design for different viewport sizes.
                            </p>

                            {
                                editorContext.editor.breakpointmanager.breakpoints.map((bpData, index) => {
                                    return (
                                        <EditorHeaderBreakpointsSettingItem
                                            key={bpData.name}
                                            bpData={bpData}
                                            nextBpData={editorContext.editor.breakpointmanager.breakpoints[index - 1]}
                                            onEditMode={this.clearEditMode}
                                            ref={this.getBpItemRef(bpData.name)}
                                        />
                                    )
                                })
                            }

                            {
                                this.state.newBpData &&
                                <EditorHeaderBreakpointsSettingItem
                                    bpData={this.state.newBpData}
                                    onCancel={() => {
                                        this.setState({newBpData: undefined});
                                    }}
                                />
                            }

                            <Button
                                className="BpSettingAddBp"
                                onClick={() => {
                                    this.clearEditMode();
                                    this.setState({newBpData: {}});
                                }}
                            >
                                Add New Breakpoint
                            </Button>
                        </div>
                    </Menu>
                )}
            </EditorContext.Consumer>
        )
    }
}
