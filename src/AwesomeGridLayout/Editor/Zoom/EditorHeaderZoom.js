import React from "react";
import Menu from "@material-ui/core/Menu/Menu";
import IconButton from "../../HelperComponents/IconButton";
import Button from "@material-ui/core/Button/Button";
import Paper from "@material-ui/core/Paper/Paper";
import {EditorContext} from "../EditorContext";

export default class EditorHeaderZoom extends React.Component {
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

    render () {
        return (
            <EditorContext.Consumer>
                {editorContext => (
                    <>
                    <IconButton
                        buttonBaseStyle={{
                            marginLeft: 0,
                            marginRight: 10,
                            backgroundColor: this.state.zoomSetting && "#d2fffc",
                        }}
                        onClick={(e) => {
                            this.setState({zoomSetting: e.currentTarget});
                        }}
                    >
                        {console.log("LOG PUBLIC ADDRESS ZOOM IN: ",process.env.PUBLIC_URL + 'static/icon/edit.svg')}
                        <img
                            draggable={false}
                            width={18}
                            height={18}
                            src={process.env.PUBLIC_URL + '/static/icon/zoom-in.svg'}
                        />

                    </IconButton>

                    {
                        this.state.zoomSetting &&
                        <Menu
                            style={{
                                zIndex: 99999999999,
                            }}
                            anchorEl={this.state.zoomSetting}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            getContentAnchorEl={null}
                            anchorPosition={{ left: 0, top: 0 }}
                            PaperProps={{
                                style:{
                                    transformOrigin: "top right",
                                    transform: `scale(${1/editorContext.zoomScale})`
                                }
                            }}
                            marginThreshold={0}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={true}
                            onClose={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                this.setState({zoomSetting: undefined});
                            }}
                            MenuListProps={{
                                style: {
                                    padding: 0,
                                }
                            }}
                            transitionDuration={0}
                        >
                            <Paper style={{
                                padding: 10,
                                display: "flex",
                                alignItems: "center"
                            }}>
                                <IconButton
                                    buttonBaseStyle={{
                                        marginLeft: 0,
                                        marginRight: 10,
                                        pointerEvents: "auto"
                                    }}
                                    imageContainerStyle={{
                                        padding: 10
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        this.props.onZoomChange(Math.min(1.3, editorContext.zoomScale + 0.1));
                                    }}
                                >
                                    <img
                                        draggable={false}
                                        width={14}
                                        height={14}
                                        src={process.env.PUBLIC_URL + '/static/icon/add.svg'}
                                    />
                                </IconButton>
                                <span style={{
                                    width: 70,
                                    textAlign: "center"
                                }}>
                                    {(editorContext.zoomScale * 100).toFixed(0)}%
                                </span>
                                <IconButton
                                    buttonBaseStyle={{
                                        marginLeft: 10,
                                        marginRight: 10,
                                        pointerEvents: "auto"
                                    }}
                                    imageContainerStyle={{
                                        padding: 10
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        this.props.onZoomChange(Math.max(0.5 ,editorContext.zoomScale - 0.1));
                                    }}
                                >
                                    <img
                                        draggable={false}
                                        width={14}
                                        height={14}
                                        src={process.env.PUBLIC_URL + '/static/icon/minus.svg'}
                                    />
                                </IconButton>
                                <Button className="EditorHeaderZoomReset"
                                    onClick={(e) => {
                                        this.props.onZoomChange(1);
                                    }}
                                >
                                    Reset
                                </Button>
                            </Paper>
                        </Menu>
                    }
                    </>
                )}
            </EditorContext.Consumer>
        )
    }
}
