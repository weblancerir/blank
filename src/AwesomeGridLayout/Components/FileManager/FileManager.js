import React from "react";
import {EditorContext} from "../../Editor/EditorContext";
import IconButton from "../../HelperComponents/IconButton";
import Modal from "@material-ui/core/Modal";
import './FileManager.css';
import ButtonBase from "@material-ui/core/ButtonBase/ButtonBase";
import UploadButton from "./Components/UploadButton";
import Dropzone from 'react-dropzone'
import FileManagerHelper from "./FileManagerHelper";
import NewFolder from "./Components/NewFolder";
import {cloneObject} from "../../AwesomeGridLayoutUtils";
import CircularProgress from '@material-ui/core/CircularProgress';
import FileUploader from "./Components/FileUploader";

export default class FileManager extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);

        this.state = {
            selectedMenu: "Website Files",
            route: this.getFirstRoute(),
            selectedFile: ""
        };
    }

    componentDidMount() {
        this.loadRoute();
    }

    loadRoute = (continuationToken) => {
        // TODO call publisher server
        this.setState({list: undefined});

        this.loadingPrefix = this.getCurrentPrefix();
        FileManagerHelper.list(this.context, this.loadingPrefix, continuationToken, (list, prefix) => {
            if (this.loadingPrefix !== prefix)
                return;
            list.contents = list.contents.filter(item => {
                return !item.Key.endsWith('/');
            });
            this.setState({list});
        }, (errorMessage) => {
            this.setState({errorMessage});
        });
    }

    getCurrentPrefix = () => {
        let {route} = this.state;
        route = cloneObject(route);
        route.shift();
        let prefix = route.join('/');

        return prefix;
    }

    getFirstRoute = () => {
        let {options} = this.props;

        let route = ["Site"];
        if (options.type) {
            route.push(options.type);
        }

        return route;
    }

    createNewFolder = (name) => {
        this.setState({list: undefined});
        let folderPath = `${this.getCurrentPrefix()}/${name}`;
        FileManagerHelper.folder(this.context, folderPath, () => {
            this.loadRoute();
        }, (errorMessage) => {
            this.setState({errorMessage});
        });
    }

    changeRoute = (route) => {
        this.setState({route}, () => {
            this.loadRoute();
        });
    }

    uploadFile = (files) => {
        console.log(files)
        // TODO send files to storage and create a on done listner to show progress
        this.setState({
            uploadingData: {files, prefix: this.getCurrentPrefix()}
        })
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
                    onFileSelected={(e) => {
                        this.uploadFile(Object.values(e.target.files).map(file => {
                            return file;
                        }))
                    }}
                    multiple
                >
                    Upload New File
                </UploadButton>
            </div>
        )
    }

    openFolder = (folderName) => {
        let {route} = this.state;
        route = [...route];
        route.push(folderName);
        this.changeRoute(route);
    }

    onClickFile = (name, type) => {
        this.setState({selectedFile: name});
    }

    onDoubleClickFile = (name, type) => {
        if (type === "folder") {
            this.openFolder(name);
        }
        else {

        }
    }

    render () {
        let {options} = this.props;
        let {list, selectedMenu, selectedFile, route, uploadingData} = this.state;
        return <Modal
            open={this.props.open}
            onClose={this.props.onClose}
            aria-labelledby="simple-modal-title2"
            aria-describedby="simple-modal-description2"
            className="FileManagerModal"
            disableBackdropClick
        >
            <>
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
                        <div className="FileManagerMenuContainer">
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

                        <div className="FileManagerMenuUploadContainer">
                            <UploadButton
                                className="FileManagerMenuUploadContainerButton"
                                onFileSelected={(e) => {
                                    this.uploadFile(Object.values(e.target.files).map(file => {
                                        return file;
                                    }))
                                }}
                                multiple
                            >
                                Upload New File
                            </UploadButton>
                        </div>
                    </div>
                    <div className="FileManagerContent">
                        {
                            selectedMenu === "Website Files" &&
                            <>
                                <div className="FileManagerContentHeader">
                                    <div  className="FileManagerContentHeaderRoute">
                                        <ButtonBase
                                            style={{
                                                padding: 4,
                                                borderRadius: 4
                                            }}
                                            onClick={(e) => {
                                                this.changeRoute(this.getFirstRoute());
                                            }}
                                        >
                                            {
                                                this.state.route[0] + " > " + options.type || ""
                                            }
                                        </ButtonBase>
                                        {
                                            this.state.route.map((name, i)=> {
                                                if (i === 0)
                                                    return null;

                                                if (i === 1 && options.type)
                                                    return null;

                                                return (
                                                    <ButtonBase
                                                        key={name}
                                                        style={{
                                                            padding: 4,
                                                            borderRadius: 4,
                                                        }}
                                                        onClick={(e) => {
                                                            let newRoute = this.getFirstRoute();
                                                            let currentRoute = [...route];
                                                            currentRoute.shift()
                                                            if (options.type)
                                                                currentRoute.shift();

                                                            let next = currentRoute.shift();
                                                            while (next !== name) {
                                                                newRoute.push(next);
                                                                next = currentRoute.shift();
                                                            }
                                                            newRoute.push(name);

                                                            this.changeRoute(newRoute);
                                                        }}
                                                    >
                                                        {" > " + name}
                                                    </ButtonBase>
                                                )
                                            })
                                        }
                                    </div>

                                    <IconButton
                                        buttonBaseStyle={{
                                        }}
                                        imageContainerStyle={{
                                            padding: 0
                                        }}
                                        onClick={(e) => {
                                            let newRoute = [...route];
                                            if (!options.type && route.length === 1)
                                                return;
                                            if (options.type && route.length === 2)
                                                return;

                                            newRoute.pop();

                                            this.changeRoute(newRoute);
                                        }}
                                    >
                                        <img
                                            draggable={false}
                                            width={20}
                                            height={20}
                                            src={require('../../icons/folderback.svg')}
                                        />
                                    </IconButton>

                                    <IconButton
                                        buttonBaseStyle={{
                                            marginLeft: 16
                                        }}
                                        imageContainerStyle={{
                                            padding: 0
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

                                <Dropzone
                                    onDrop={acceptedFiles => console.log(acceptedFiles)}
                                >
                                    {({getRootProps, getInputProps}) => (
                                        <div
                                            className="FileManagerContentData"
                                            {...getRootProps({
                                                onClick: event => {
                                                    this.onClickFile("");
                                                    event.stopPropagation()
                                                }
                                            })}
                                        >
                                            <input {...getInputProps()} />
                                            {
                                                !list &&
                                                <div className="FileManagerLoadingContainer">
                                                    <CircularProgress />
                                                </div>
                                            }
                                            {
                                                list && list.contents.length === 0 &&
                                                list.folders.length === 0 &&
                                                this.getEmptyFolder()
                                            }
                                            <div className="FileManagerFileContainer">
                                                {
                                                    list &&
                                                    list.folders.map(folderPath => {
                                                        let folderName = folderPath.split('/')[0];
                                                        return (
                                                            <div key={folderPath} className="FileManagerFileRoot">
                                                                <div>
                                                                    <div
                                                                        className={`FileManagerFileData ${
                                                                            selectedFile === folderPath ?
                                                                                "FileManagerFileSelected" : ""
                                                                        }`}
                                                                        onClick={
                                                                            (e) => {
                                                                                e.stopPropagation();
                                                                                this.onClickFile(folderPath, "folder");
                                                                            }
                                                                        }
                                                                        onDoubleClick={
                                                                            (e) => {
                                                                                e.stopPropagation();
                                                                                this.onDoubleClickFile(folderPath, "folder");
                                                                            }
                                                                        }
                                                                    >
                                                                        <img draggable={false} width={56} height={56}
                                                                             src={require('../../icons/file.svg')}
                                                                             style={{
                                                                                 userDrag: "none",
                                                                                 userSelect: "none"
                                                                             }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <span className="FileManagerFileName">
                                                                    {folderName}
                                                                </span>
                                                            </div>
                                                        )
                                                    })
                                                }
                                                {
                                                    list &&
                                                    list.contents.map(fileData => {
                                                        return null;
                                                    })
                                                }
                                            </div>

                                            {
                                                uploadingData &&
                                                <FileUploader
                                                    prefix={uploadingData.prefix}
                                                    files={uploadingData.files}
                                                />
                                            }
                                        </div>
                                    )}
                                </Dropzone>
                            </>
                        }
                        <div className="FileManagerUploadingRoot">
                            {/*TODO show upload progress of uploading files*/}
                        </div>
                    </div>
                </div>
            </div>

            {
                this.state.newFolder &&
                <NewFolder
                    open={true}
                    onClose={(e) => {this.setState({newFolder: false})}}
                    onDone={this.createNewFolder}
                />
            }
            </>
        </Modal>
    }
}
