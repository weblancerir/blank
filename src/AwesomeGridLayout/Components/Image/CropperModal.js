import React from 'react'
import Cropper from 'react-easy-crop'
import Modal from "@material-ui/core/Modal";
import IconButton from "../../HelperComponents/IconButton";
import Slider from '@material-ui/core/Slider'
import './Cropper.css';
import Button from "@material-ui/core/Button/Button";

export default class CropperModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            imageSrc: props.imageSrc,
            crop: props.crop,
            zoom: props.zoom,
            aspect: props.aspect,
        }
    }

    onCropChange = (crop) => {
        this.setState({ crop })
    }

    onCropComplete = (croppedArea, croppedAreaPixels) => {
        console.log(croppedArea, croppedAreaPixels)
        this.setState({croppedArea, croppedAreaPixels})
    }

    onZoomChange = (zoom) => {
        this.setState({ zoom })
    }

    render() {
        return (<Modal
            open={this.props.open}
            onClose={this.props.onClose}
            aria-labelledby="simple-modal-title2"
            aria-describedby="simple-modal-description2"
            className="FileManagerModal"
            disableBackdropClick
        >
            <div className="CropperRoot">
                {/*Header*/}
                <div className="FileManagerHeader">
                    <div
                        className="PageManagerHeaderContainer"
                    >
                            <span className="PageManagerHeaderTitle">
                                Image Cropper
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

                <div className="CropperContainer">
                    <div className="CropperMargin">
                        <Cropper
                            image={this.state.imageSrc}
                            crop={this.state.crop}
                            zoom={this.state.zoom}
                            aspect={this.state.aspect}
                            onCropChange={this.onCropChange}
                            onCropComplete={this.onCropComplete}
                            onZoomChange={this.onZoomChange}
                        />
                    </div>
                    <div className="CropperFooter">
                        <span className="CropperZoomSpan">
                            Zoom Level
                        </span>
                        <div className="CropperZoom">
                            <Slider
                                value={this.state.zoom}
                                min={1}
                                max={3}
                                step={0.05}
                                onChange={(e, zoom) => this.onZoomChange(zoom)}
                            />
                        </div>
                        <div className="CropperFooterSpacer">
                        </div>
                        <IconButton
                            buttonBaseStyle={{
                                marginLeft: 0
                            }}
                            imageContainerStyle={{
                            }}
                            onClick={(e) => {
                                this.setState({
                                    zoom: 1,
                                    crop: {x:0, y: 0},
                                    croppedAreaPixels: undefined,
                                    croppedArea: undefined
                                })
                            }}
                            className="CropperReset"
                        >
                            <img
                                draggable={false}
                                width={20}
                                height={20}
                                src={require('../../icons/refresh.svg')}
                            />
                        </IconButton>
                        <div className="CropperFooterSpacer">
                        </div>

                        <Button
                            className="CropperCancel"
                            // variant="contained"
                            color="primary"
                            onClick={() => {
                                this.props.onClose();
                            }}
                        >
                            Cancel
                        </Button>

                        <Button
                            className="CropperDone"
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                this.props.onClose();
                                this.props.onDone({
                                    zoom: this.state.zoom,
                                    crop:this.state.crop,
                                    croppedArea: this.state.croppedArea,
                                    croppedAreaPixels:this.state.croppedAreaPixels,
                                })
                            }}
                        >
                            Done
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
        )
    }
}
