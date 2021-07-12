import React from "react";
import {EditorContext} from "../../Editor/EditorContext";
import IconButton from "../../HelperComponents/IconButton";
import './FileManager.css';
import ButtonBase from "@material-ui/core/ButtonBase/ButtonBase";
import UploadButton from "./Components/UploadButton";
import Dropzone from 'react-dropzone'
import FileManagerHelper from "./FileManagerHelper";
import NewFolder from "./Components/NewFolder";
import {cloneObject} from "../../AwesomeGridLayoutUtils";
import CircularProgress from '@material-ui/core/CircularProgress';
import FileUploader from "./Components/FileUploader";
import MultiColorProgressBar from "./Components/MultiColorProgressBar";
import MenuButton from "../../Menus/MenuBase/MenuButton";
import DomainManager from "../../Editor/DomainManager";
import {inputCopyPasteHandler} from "../../AwesomwGridLayoutHelper";

export default class FileManager extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);

        this.state = {
            selectedMenu: "Website Files",
            route: this.getFirstRoute(),
            selectedFile: "",
            selectedFiles: []
        };

        this.uploaderRef = React.createRef();
    }

    componentDidMount() {
        FileManagerHelper.storage(this.context, ({url}) => {
            this.baseUrl = url;
            this.loadRoute();
        }, (errorMessage) => {
            console.log("storage error", errorMessage)
        });
    }

    loadRoute = (continuationToken) => {
        // TODO call publisher server
        this.setState({list: undefined, selectedFile: undefined, selectedFiles: []});

        this.loadingPrefix = this.getCurrentPrefix();
        FileManagerHelper.list(this.context, this.loadingPrefix, continuationToken, (list, prefix) => {
            if (this.loadingPrefix !== prefix)
                return;

            list.contents = list.contents.filter(item => {
                return !item.Key.endsWith('/');
            });

            list.folders = list.folders.filter(folder => {
                return folder !== "favIcons";
            });

            this.setState({list});
        }, (errorMessage) => {
            this.setState({errorMessage});
        });

        this.loadUserUsage();
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
        if (!this.isFilesValid(files)) {
            this.showError("Upload files with valid extention !");
            return;
        }

        if (this.uploaderRef.current)
            this.uploaderRef.current.addFiles(files, this.getCurrentPrefix());
        else
            this.setState({
                uploadingData: {files, prefix: this.getCurrentPrefix()}
            })
    }

    getValidFileExt = (type) => {
        if (!type)
            type = this.props.options.type;

        type = (type || "").toLowerCase();
        switch (type) {
            case "images":
                return [
                    "jpg", "jpeg", "png",
                    "gif", "jpe", "jfif",
                    "bmp", "heic", "heif",
                    "tiff", "tif", "png",
                    "tiff", "tif", "svg",
                    "tiff", "tif", "webp"
                ]
                break;
            case "voices":
                return [
                    "mp3", "wav", "flac",
                    "m4a", "wma", "aac",
                    "aif", "aiff"
                ]
                break;
            case "videos":
                return [
                    "avi", "mpeg", "mpg",
                    "mpe", "mp4", "mkv",
                    "webm", "mov", "ogv",
                    "vob", "m4v", "3gp",
                    "divx", "xvid", "mxf",
                    "wmv", "m1v", "flv",
                    "m2ts"
                ]
                break;
            case "documents":
                return [
                    "all"
                ]
                break;
        }

        console.log("getValidFileExt", "here2")
        return [
            "all"
        ];
    }

    isFilesValid = (files) => {
        let validExt = this.getValidFileExt();

        if (validExt.includes("all"))
            return  true;

        let valid = true;
        files.forEach(file => {
            let ext = file.name.split('.').pop();

            if (!validExt.includes(ext.toLowerCase()))
                valid = false;
        });

        return valid;
    }

    showError = (message) => {
        console.log("showError", message);
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
                    accept={
                        this.getValidFileExt().includes("all") ? undefined :
                        this.getValidFileExt().map(e => `.${e}`).join(',')
                    }
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
        if (!name) {
            this.setState({selectedFile: "", selectedFiles: []});
            return;
        }

        this.setState({selectedFile: name, selectedFiles: [name]});
    }

    onDoubleClickFile = (name, type) => {
        if (type === "folder") {
            this.openFolder(name);
        }
        else {

        }
    }

    getFileIconPreview = (fileData) => {
        let {siteData} = this.context;
        let filename = fileData.Key.split('/')[fileData.Key.split('/').length - 1];
        let extention = filename.split('.').pop();
        console.log("getFileIconPreview", this.getValidFileExt("images"), extention)
        if (this.getValidFileExt("images").includes(extention)) {
            return (
                <img draggable={false}
                     className="FileManagerImageIcon"
                     src={
                         `${DomainManager.getStorageBaseUrl(siteData)}${fileData.Key}`
                     }
                     style={{
                         userDrag: "none",
                         userSelect: "none"
                     }}
                />
            )
        } else {
            return (
                <div className="FileManagerNonImageRoot">
                    <img draggable={false}
                         className="FileManagerNonImageIcon"
                         src={process.env.PUBLIC_URL + '/static/icon/fileicon.png'}
                            style={{
                                     userDrag: "none",
                                     userSelect: "none"
                                 }}
                    />
                    <span className="FileManagerNonImageText">
                        {extention}
                    </span>
                </div>
            )
        }
    }

    deleteFiles = () => {
        let {selectedFile, selectedFiles, list} = this.state;

        let deleteObjects = [];
        selectedFiles.forEach(filename => {
            if (this.getFileType(filename) === "file")
                deleteObjects.push({Key: `${this.getCurrentPrefix()}/${filename}`})
        });

        let currentPrifix = this.getCurrentPrefix();
        FileManagerHelper.delete(this.context, deleteObjects, () => {
            if (currentPrifix === this.getCurrentPrefix())
                this.loadRoute();
        }, (errorMessage) => {
            this.setState({errorMessage});
        });
    }

    getFileType = (selectedFile) => {
        let {list} = this.state;

        let isFile = list.contents.find(f => {
            let filename = f.Key.split('/')[f.Key.split('/').length - 1];
            return filename === selectedFile;
        });

        let isFolder = list.folders.find(f => {
            let folderName = f.split('/')[0];
            return folderName === selectedFile;
        });

        if (isFile)
            return "file";

        if (isFolder)
            return "folder";

        return "unknown";
    }

    selectedFilesContainFile = () => {
        let {list, selectedFiles} = this.state;

        if (!list)
            return false;

        let found = false;
        list.contents.forEach(f => {
            let filename = f.Key.split('/')[f.Key.split('/').length - 1];
            if (selectedFiles.includes(filename))
                found = true;
        });

        return found;
    }

    addFileManually = (fileData) => {
        if (fileData.prefix !== this.getCurrentPrefix())
            return;

        let {list} = this.state;

        list.contents.push({
            Key: `${list.basePrefix}/${fileData.prefix}/${fileData.file.name}`
        })

        this.forceUpdate();
    }

    loadUserUsage = () => {
        FileManagerHelper.usage(this.context, (usageData) => {
            this.setState({usageData})
        }, (errorMessage) => {
            this.setState({errorMessage});
        });
    }

    getUsageColor = () => {
        let {usageData} = this.state;

        let usagePercent = this.getUsagePercent();
        if (usagePercent < 50)
            return "#53ff30";
        if (usagePercent < 80)
            return "#f8ff30";
        if (usagePercent < 90)
            return "#ff8a30";
        // if (usagePercent < 100)
        return "#ff3030";
    }

    getUsagePercent = () => {
        let {usageData} = this.state;
        return usageData.usage / 500 / 1024 / 1024 * 100;
    }

    render () {
        let {options, onDone, onClose} = this.props;
        let {list, usageData, selectedMenu, selectedFiles, route, uploadingData} = this.state;
        // return <Modal
        //     open={this.props.open}
        //     onClose={this.props.onClose}
        //     aria-labelledby="simple-modal-title2"
        //     aria-describedby="simple-modal-description2"
        //     className="FileManagerModal"
        //     disableBackdropClick
        // >
        return (
            <>
            <div className="FileManagerRoot" style={this.props.rootStyle}>
                {/*Header*/}
                {
                    !options.noHeader &&
                    <div className="FileManagerHeader">
                        <div
                            className="PageManagerHeaderContainer"
                        >
                            <span className="PageManagerHeaderTitle">
                                File Manager
                            </span>

                            {
                                this.props.onClose &&
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
                            }
                        </div>
                    </div>
                }

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
                                accept={
                                    this.getValidFileExt().includes("all") ? undefined :
                                    this.getValidFileExt().map(e => `.${e}`).join(',')
                                }
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
                                                this.state.route[0] +
                                                (options.type ? " > " + options.type || "": "")
                                            }
                                        </ButtonBase>
                                        {
                                            this.state.route.map((name, i)=> {
                                                if (i === 0)
                                                    return null;

                                                if (i === 1 && options.type)
                                                    return null;

                                                return (
                                                    <React.Fragment
                                                        key={name}
                                                    >
                                                        >
                                                        <ButtonBase
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
                                                            {name}
                                                        </ButtonBase>
                                                    </React.Fragment>
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

                                    <IconButton
                                        buttonBaseStyle={{
                                            marginLeft: 16
                                        }}
                                        imageContainerStyle={{
                                            padding: 0
                                        }}
                                        onClick={(e) => {
                                            this.deleteFiles();
                                        }}
                                        disabled={!this.selectedFilesContainFile()}
                                    >
                                        {
                                            !this.selectedFilesContainFile()?
                                                <img
                                                    draggable={false}
                                                    width={20}
                                                    height={20}
                                                    src={require('../../icons/bindisable.svg')}
                                                />
                                                :
                                                <img
                                                    draggable={false}
                                                    width={20}
                                                    height={20}
                                                    src={require('../../icons/bin.svg')}
                                                />
                                         }
                                    </IconButton>
                                </div>

                                <Dropzone
                                    onDrop={acceptedFiles => this.uploadFile(acceptedFiles)}
                                >
                                    {({getRootProps, getInputProps}) => (
                                        <div
                                            className="FileManagerContentData"
                                            {...getRootProps({
                                                onClick: event => {
                                                    this.onClickFile();
                                                    event.stopPropagation()
                                                }
                                            })}
                                        >
                                            <input {...getInputProps()}
                                                   onKeyDown={inputCopyPasteHandler}
                                            />
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
                                                                            selectedFiles.includes(folderPath) ?
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
                                                        let filename = fileData.Key.split('/')[fileData.Key.split('/').length - 1];

                                                        let shortName = filename.split('.').slice(0, -1).join('.');

                                                        let extention = filename.split('.').pop();
                                                        return (
                                                            <div key={filename} className="FileManagerFileRoot">
                                                                <div>
                                                                    <div
                                                                        className={`FileManagerFileData ${
                                                                            selectedFiles.includes(filename) ?
                                                                                "FileManagerFileSelected" : ""
                                                                        }`}
                                                                        onClick={
                                                                            (e) => {
                                                                                e.stopPropagation();
                                                                                this.onClickFile(filename, "file");
                                                                            }
                                                                        }
                                                                        onDoubleClick={
                                                                            (e) => {
                                                                                e.stopPropagation();
                                                                                this.onDoubleClickFile(filename, "file");
                                                                            }
                                                                        }
                                                                    >
                                                                        {this.getFileIconPreview(fileData)}
                                                                    </div>
                                                                </div>
                                                                <div className="FileManagerFileNameHolder">
                                                                    <span className="FileManagerFileName">
                                                                        {shortName}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>

                                            {
                                                uploadingData &&
                                                <FileUploader
                                                    ref={this.uploaderRef}
                                                    prefix={uploadingData.prefix}
                                                    files={uploadingData.files}
                                                    onFinish={() => {
                                                        this.setState({uploadingData: undefined})
                                                    }}
                                                    onSingleFileUploaded={this.addFileManually}
                                                />
                                            }
                                        </div>
                                    )}
                                </Dropzone>

                                <div className="FileManagerContentFooter">
                                        <div className="FileManagerContentUsageRoot">
                                            {
                                                usageData &&
                                                <>
                                                    <div className="FileManagerContentUsageLabelRoot">
                                                    <span className="FileManagerContentUsageLabel">
                                                        Website Usage
                                                    </span>
                                                        <span>
                                                        {
                                                            `${(usageData.usage / 1024 / 1024).toFixed(2)} Mb / 500 Mb`
                                                        }
                                                    </span>
                                                    </div>
                                                    <MultiColorProgressBar
                                                    readings={[
                                                        {
                                                            name: 'Used Space',
                                                            value: this.getUsagePercent(),
                                                            color: this.getUsageColor()
                                                        },
                                                        {
                                                            name: 'Free Space',
                                                            value: 100 - this.getUsagePercent(),
                                                            color: '#f8f8f8'
                                                        }
                                                    ]}
                                                    />
                                                </>
                                            }
                                        </div>
                                    {
                                        onDone &&
                                        <div className="FileManagerContentCallbackRoot">
                                            <ButtonBase
                                                className={
                                                    selectedFiles.length > 0 ?
                                                    "FileManagerMenuSelectButton" :
                                                    "FileManagerMenuSelectButtonDisabled"
                                                }
                                                onClick={(e) => {
                                                    onClose();
                                                    onDone(selectedFiles.map(filename => {
                                                        return {
                                                            url: `${this.baseUrl}/${list.basePrefix}/${this.getCurrentPrefix()}/${filename}`,
                                                            pathname: `${list.basePrefix}/${this.getCurrentPrefix()}/${filename}`
                                                        }
                                                    }));
                                                }}
                                            >
                                                Select
                                            </ButtonBase>
                                        </div>
                                    }
                                </div>
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
        )
        // </Modal>
    }
}
