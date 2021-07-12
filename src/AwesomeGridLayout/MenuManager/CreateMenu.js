import React from "react";
import {EditorContext} from "../Editor/EditorContext";
import IconButton from "../HelperComponents/IconButton";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button/Button";
import './CreateMenu.css'
import {inputCopyPasteHandler} from "../AwesomwGridLayoutHelper";

export default class CreateMenu extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);
        this.state = {name: ""};
    }

    rename = (e) => {
        this.setState({name: e.target.value})
    }

    render () {
        return <Modal
            open={this.props.open}
            onClose={this.props.onClose}
            aria-labelledby="simple-modal-title2"
            aria-describedby="simple-modal-description2"
            className="FileManagerModal"
            disableBackdropClick
            disableEnforceFocus
        >
            <div className="CreateMenuRoot">
                {/*Header*/}
                <div className="FileManagerHeader">
                    <div
                        className="PageManagerHeaderContainer"
                    >
                            <span className="PageManagerHeaderTitle">
                                {this.props.title || "New Menu"}
                            </span>

                        <IconButton
                            onClick={this.props.onClose}
                        >
                            <img
                                draggable={false}
                                width={12}
                                height={12}
                                src={require('../icons/close.svg')}
                            />
                        </IconButton>
                    </div>
                </div>

                <div className="CreateMenuContainer">
                    <span className="CreateMenuTitle">
                        {this.props.label || "What's menu name?"}
                    </span>
                    <input
                        defaultValue={this.props.defaultValue}
                        className="NumberInput PageManagerRenameInput PageInfoNameInput"
                        type="text"
                        onChange={this.rename}
                        onKeyDown={(e) => {
                            if((e.keyCode || e.which) === 13) {
                                if (this.state.name.length >= 3) {
                                    this.props.onClose();
                                    this.props.onDone(this.state.name)
                                }
                            }
                            inputCopyPasteHandler(e)
                        }}
                        autoFocus
                    >
                    </input>

                    <div>
                        <Button
                            className="CreateMenuCreate"
                            variant="contained"
                            color="primary"
                            disabled={this.state.name.length < 3}
                            onClick={() => {
                                this.props.onClose();
                                this.props.onDone(this.state.name)
                            }}
                        >
                            {this.props.confirmLabel || "Create"}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    }
}
