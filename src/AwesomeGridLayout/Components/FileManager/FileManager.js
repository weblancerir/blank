import React from "react";
import {EditorContext} from "../../Editor/EditorContext";
import IconButton from "../../HelperComponents/IconButton";
import Modal from "@material-ui/core/Modal";
import './FileManager.css';
import ButtonBase from "@material-ui/core/ButtonBase/ButtonBase";
import UploadButton from "./Components/UploadButton";

export default class FileManager extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);

        this.state = {
            selectedMenu: "Website Files",
            route: this.getFirstRoute(),
        };
    }

    componentDidMount() {
        this.loadRoute();
    }

    loadRoute = (continuationToken) => {
        // TODO call publisher server
        this.setState({list:{
            contents: [],
            folders: [],
            continuationToken: "",
            nextContinuationToken: ""
        }}) ;
    }

    getFirstRoute = () => {
        let {options} = this.props;

        let route = ["Site"];
        if (options.type) {
            route.push(options.type);
        }

        return route;
    }

    addNewFolder = () => {

    }

    uploadFile = (files) => {
        // TODO send files to storage and create a on done listner to show progress
    }

    getEmptyFolder = () => {
        return (
            <div className="FileManagerEmptyFolderRoot">
                <img
                    className="FileManagerEmptyFolderImage"
                    draggable={false}
                    width={20}
                    height={20}
                    src={require('../../icons/cloudupload.svg')}
                />
                <span className="FileManagerEmptyFolderTitle">Start adding your files</span>
                <span className="FileManagerEmptyFolderMessage">Drag and drop files or upload from your computer</span>
                <span className="FileManagerEmptyFolderMessage">Or</span>
                <UploadButton
                    className="FileManagerEmptyFolderUploadButton"
                    onFileSelected={(e) => {this.uploadFile(e.target.files)}}
                >
                    Upload New File
                </UploadButton>
            </div>
        )
    }

    render () {
        let {options} = this.props;
        let {list, selectedMenu} = this.state;
        return <Modal
            open={this.props.open}
            onClose={this.props.onClose}
            aria-labelledby="simple-modal-title2"
            aria-describedby="simple-modal-description2"
            className="FileManagerModal"
            disableBackdropClick
        >
            <div className="FileManagerRoot">
                {/*Header*/}
                <div className="FileManagerHeader">
                    <div
                        className="PageManagerHeaderContainer"
                    >
                            <span className="PageManagerHeaderTitle">
                                File Manager
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

                <div className="FileManagerContainer">
                    <div className="FileManagerMenu">
                        <span className="FileManagerMenuTitle">
                            Manage
                        </span>

                        <ButtonBase
                            className={`FileManagerMenuOptionButton ${
                                selectedMenu === "Website Files" ? "FileManagerMenuOptionSelected": ""
                            }`}
                            onClick={(e) => {this.setState({selectedMenu: "Website Files"})}}>
                            <span className="FileManagerMenuOption">
                                Website Files
                            </span>
                        </ButtonBase>
                    </div>
                    <div className="FileManagerContent">
                        {
                            selectedMenu === "Website Files" &&
                            <>
                                <div className="FileManagerContentHeader">
                                    <div  className="FileManagerContentHeaderRoute">
                                        {
                                            this.state.route[0] + " > " + options.type || ""
                                        }
                                        {
                                            this.state.route.map((r, i)=> {
                                                if (i === 0)
                                                    return null;

                                                if (i === 1 && options.type)
                                                    return null;

                                                return r + (i !== this.state.route.length - 1 ? " > ": "")
                                            })
                                        }
                                    </div>

                                    <IconButton
                                        buttonBaseStyle={{
                                            marginRight: 4,
                                            marginLeft: 4,
                                        }}
                                        imageContainerStyle={{
                                            padding: 6
                                        }}
                                        onClick={(e) => {
                                            this.setState({newFolder: true});
                                        }}
                                    >
                                        <img
                                            draggable={false}
                                            width={20}
                                            height={20}
                                            src={require('../../icons/folder.svg')}
                                        />
                                    </IconButton>
                                </div>

                                <div className="FileManagerContentData">
                                    {
                                        !list &&
                                        <div>
                                            Loading
                                        </div>
                                    }
                                    {
                                        list && list.contents.length === 0 &&
                                        list.folders.length === 0 &&
                                        this.getEmptyFolder()
                                    }
                                    {
                                        list &&
                                        list.folders.map(folderPath => {
                                            let folderName = folderPath.split('/')[0];
                                            return null;
                                        })
                                    }
                                    {
                                        list &&
                                        list.contents.map(fileData => {
                                            return null;
                                        })
                                    }
                                </div>
                            </>
                        }
                    </div>
                    <div className="FileManagerUploadingRoot">
                        {/*TODO show upload progress of uploading files*/}
                    </div>
                </div>
            </div>
        </Modal>
    }
}
