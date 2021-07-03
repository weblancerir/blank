import React from 'react'
import Modal from "@material-ui/core/Modal";
import IconButton from "../../HelperComponents/IconButton";
import './FocalPoint.css';
import Button from "@material-ui/core/Button/Button";

export default class FocalPointModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        }

        this.clickerRef = React.createRef();
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    onChangePoint = (e) => {
        let rect = this.clickerRef.current.getBoundingClientRect();
        let x = (e.clientX-rect.left) / rect.width * 100;
        let y = (e.clientY-rect.top) / rect.height * 100;

        this.setState({focalPoint: {x, y}})
    }

    isLeftClick = (e) => {
        e.persist();
        if (e.pointerType === "mouse" && e.button === 0)
            return true;

        return false;
    };

    render() {
        let focalPoint = this.state.focalPoint || this.props.focalPoint;
        return (<Modal
            open={this.props.open}
            onClose={this.props.onClose}
            aria-labelledby="simple-modal-title2"
            aria-describedby="simple-modal-description2"
            className="FileManagerModal"
            disableBackdropClick
        >
            <div className="FocalPointRoot">
                {/*Header*/}
                <div className="FileManagerHeader">
                    <div
                        className="PageManagerHeaderContainer"
                    >
                            <span className="PageManagerHeaderTitle">
                                Image Focal Point
                            </span>

                        <IconButton
                            onClick={this.props.onClose}
                        >
                            <img
                                draggable={false}
                                width={12}
                                height={12}
                                src={require('../../icons/close.svg')}
                            />
                        </IconButton>
                    </div>
                </div>

                <div className="FocalPointContainer">
                    <div className="FocalPointMargin">
                        <div
                            className="FocalPointClicker"
                            onClick={this.onChangePoint}
                            // onMouseMove={(e) => {
                                // if (this.isLeftClick(e))
                                //     this.onChangePoint(e);
                            //}}
                            ref={this.clickerRef}
                        >
                            <img
                                className="FocalPointImage"
                                src={this.props.src}
                                draggable={false}
                            />
                            <div
                                className="FocalPointPoint"
                                style={{
                                    top: `${focalPoint.y}%`,
                                    left: `${focalPoint.x}%`
                                }}
                            >

                            </div>
                        </div>
                    </div>

                    <div className="FocalPointFooter">
                        <Button
                            className="FocalPointDone"
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                this.props.onClose();
                                this.props.onDone(focalPoint)
                            }}
                        >
                            Done
                        </Button>

                        <Button
                            className="FocalPointCancel"
                            // variant="contained"
                            color="primary"
                            onClick={() => {
                                this.props.onClose();
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
        )
    }
}
