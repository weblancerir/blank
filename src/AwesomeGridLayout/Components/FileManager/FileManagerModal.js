import React from "react";
import {EditorContext} from "../../Editor/EditorContext";
import Modal from "@material-ui/core/Modal";
import './FileManager.css';
import FileManager from "./FileManager";

export default class FileManagerModal extends React.Component {
    static contextType = EditorContext;
    render () {
        return <Modal
            open={this.props.open}
            onClose={this.props.onClose}
            aria-labelledby="simple-modal-title2"
            aria-describedby="simple-modal-description2"
            className="FileManagerModal"
            disableBackdropClick
        >
            <FileManager {...this.props}/>
        </Modal>
    }
}
