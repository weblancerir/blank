import React from "react";
import './EditorHeaderBreakpointsSettingItem.css';
import {EditorContext} from "../EditorContext";
import {getBreakpointIcon} from "./BreakpointHelper";
import NumberInputEnterToChange from "../../Menus/CommonComponents/NumberInputEnterToChange";
import IconButton from "../../HelperComponents/IconButton";
import {Button} from "@material-ui/core";
import {v4 as uuidv4} from "uuid";

export default class EditorHeaderBreakpointsSettingItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editMode: props.bpData.name? false: true
        };
    }

    componentDidMount () {
        this.mounted = true;
    }

    componentWillUnmount () {
        this.mounted = false;
    }

    isHighestBp = (editorContext) => {
        let {bpData} = this.props;
        return editorContext.editor.breakpointmanager.getHighestBpName() === bpData.name;
    };

    done = (editorContext) => {
        let {bpData} = this.props;

        if (isNaN(this.tempEnd)) {
            return;
        }

        this.tempEnd = parseInt(this.tempEnd);

        editorContext.editor.breakpointmanager.updateBreakpoint(
            bpData.name, undefined, this.tempEnd
        );

        this.setState({editMode: false})

        editorContext.update();
    };

    create = (editorContext) => {
        if (!this.tempEnd)
            this.tempEnd = editorContext.pageSize;

        if (isNaN(this.tempEnd)) {
            return;
        }

        this.tempEnd = parseInt(this.tempEnd);

        let {newBpData, prevBpData} = editorContext.editor.breakpointmanager.updateBreakpoint(
            uuidv4(), this.tempEnd, undefined
        );

        this.props.onCancel();

        editorContext.onNewBpAdded(newBpData, prevBpData);
    };

    delete = (editorContext) => {
        let {bpData} = this.props;

        editorContext.editor.breakpointmanager.deleteBreakpoint(bpData.name);

        editorContext.update();
    }

    cancelEditMode = () => {
        this.setState({editMode: false});
    };

    render () {
        let {bpData, nextBpData} = this.props;
        return (
            <EditorContext.Consumer>
                {editorContext => (
                    <div className="BreakpointSettingItemRoot">
                        <div className="BreakpointSettingItemIcon">
                            {
                                getBreakpointIcon(bpData)
                            }
                        </div>

                        {
                            bpData.name &&
                            <p className="BreakpointSettingItemStart">
                                {bpData.start} {
                                    this.isHighestBp(editorContext) ? " & Up" : " -"
                                }
                            </p>
                        }

                        {
                            !this.state.editMode &&
                            !this.isHighestBp(editorContext) &&
                            <p className="BreakpointSettingItemEndText">
                                {bpData.end}
                            </p>
                        }

                        {
                            this.state.editMode &&
                            !this.isHighestBp(editorContext) &&
                            <NumberInputEnterToChange
                                className="BreakpointSettingItemEndInput"
                                inputStyle={{
                                    marginLeft: 0
                                }}
                                min={bpData.name? bpData.start + 1: 320}
                                max={bpData.name? nextBpData.end - 2 : 9999}
                                value={bpData.end || editorContext.pageSize}
                                onChange={(tempEnd) => {
                                    this.tempEnd = tempEnd;
                                }}
                                onKeyPress={() => {
                                    bpData.name?
                                        this.done(editorContext):
                                        this.create(editorContext);
                                }}
                                lazy
                            />
                        }

                        {
                            !this.isHighestBp(editorContext) &&
                            <p className="BreakpointSettingItemPx">
                                {"px"}
                            </p>
                        }

                        {
                            !this.state.editMode &&
                            !this.isHighestBp(editorContext) &&
                            <div className="BreakpointSettingItemNoneEdit">
                                <IconButton
                                    onClick={() => {
                                        this.delete(editorContext)
                                    }}
                                >
                                    <img
                                        draggable={false}
                                        width={16}
                                        height={16}
                                        src={'/static/icon/delete.svg'}
                                    />
                                </IconButton>
                                <IconButton
                                    onClick={() => {
                                        this.props.onEditMode && this.props.onEditMode();
                                        this.setState({editMode: true})
                                        this.tempEnd = bpData.end;
                                    }}
                                >
                                    <img
                                        draggable={false}
                                        width={16}
                                        height={16}
                                        src={'/static/icon/edit2.svg'}
                                    />
                                </IconButton>
                            </div>
                        }

                        {
                            this.state.editMode &&
                            !this.isHighestBp(editorContext) &&
                            <div className="BreakpointSettingItemEditMode">
                                {
                                    bpData.name &&
                                    <Button
                                        variant="contained"
                                        className="BreakpointSettingItemButtons BreakpointSettingItemDone"
                                        onClick={() => {
                                            this.done(editorContext);
                                        }}
                                    >
                                        Done
                                    </Button>
                                }
                                {
                                    !bpData.name &&
                                    <Button
                                        variant="contained"
                                        className="BreakpointSettingItemButtons BreakpointSettingItemDone"
                                        onClick={() => {
                                            this.create(editorContext);
                                        }}
                                    >
                                        Create
                                    </Button>
                                }
                                <Button
                                    className="BreakpointSettingItemButtons BreakpointSettingItemCancel"
                                    onClick={() => {
                                        bpData.name ?
                                            this.setState({editMode: false}) :
                                            this.props.onCancel();
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        }
                    </div>
                )}
            </EditorContext.Consumer>
        )
    }
}
