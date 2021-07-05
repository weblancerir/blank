import React from "react";
import IconButton from "../../../HelperComponents/IconButton";
import Modal from "@material-ui/core/Modal";
import './Confirm.css';
import Button from "@material-ui/core/Button/Button";

export default class Confirm extends React.Component {
    render () {
        let {title, message, yesText, noText, onYes, onNo, onClose, open} = this.props;
        return <Modal
            open={open || true}
            onClose={onClose}
            aria-labelledby="simple-modal-title2"
            aria-describedby="simple-modal-description2"
            className="FileManagerModal"
            disableBackdropClick
            disableEnforceFocus
        >
            <div className="NewFolderRoot">
                {/*Header*/}
                <div className="FileManagerHeader">
                    <div
                        className="PageManagerHeaderContainer"
                    >
                            <span className="PageManagerHeaderTitle">
                                {title || "Confirmation"}
                            </span>

                        <IconButton
                            onClick={onClose}
                        >
                            <img
                                draggable={false}
                                width={12}
                                height={12}
                                src={require('../../../icons/close.svg')}
                            />
                        </IconButton>
                    </div>
                </div>

                <div className="NewFolderContainer">
                    <span className="NewFolderTitle">
                        {message || "Are you sure ?"}
                    </span>

                    <div className="ConfirmButtonRoot">
                        <Button
                            className="ConfirmYes"
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                onClose && onClose();
                                onYes && onYes();
                            }}
                        >
                            {yesText || "Yes"}
                        </Button>
                        <Button
                            className="ConfirmNo"
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                onClose && onClose();
                                onNo && onNo();
                            }}
                        >
                            {noText || "No"}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    }
}
