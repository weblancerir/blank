import React from "react";
import {EditorContext} from "../../../Editor/EditorContext";
import FileManagerHelper from "../FileManagerHelper";
import axios from "axios";
import LinearProgress from '@material-ui/core/LinearProgress';
import './FileUploader.css';
import IconButton from "../../../HelperComponents/IconButton";

export default class FileUploader extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);

        this.state = {
            files: props.files.map(f => {return {
                file: f,
                status: "pending",
                progress: 0,
                prefix: props.prefix,
            }}),
            // TODO for test
            // currentUploading: {
            //     file: {name: "test.jpeg"},
            //     progress: 24,
            // },
            // files: [
            //     {
            //         file: {name: "test2.jpeg"},
            //         status: "pending",
            //     },
            //     {
            //         file: {name: "test3.jpeg"},
            //         status: "pending",
            //     },
            //     {
            //         file: {name: "test4.jpeg"},
            //         status: "pending",
            //     },
            //     {
            //         file: {name: "test5.jpeg"},
            //         status: "pending",
            //     },
            //     {
            //         file: {name: "test6.jpeg"},
            //         status: "pending",
            //     },
            //     {
            //         file: {name: "test7.jpeg"},
            //         status: "pending",
            //     }
            // ],
        };
    }

    componentDidMount() {
        this.next();
    }

    addFiles = (newFIles, prefix) => {
        let {files} = this.state;
        files = [...files];
        newFIles.forEach(f => {
            files.push({
                file: f,
                status: "pending",
                progress: 0,
                prefix: prefix
            });
        })

        this.setState({files}, () => {
            if (!this.working)
                this.next();
        });
    }

    finishing = () => {
        this.working = false;
        this.props.onFinish();
    }

    next = () => {
        this.working = true;
        let {files} = this.state;
        files = [...files];

        if (files.length < 1) {
            this.finishing();
            return;
        }

        let currentUploading = files.shift();
        if (currentUploading.status !== "pending")
            return;

        currentUploading.status = "starting";

        this.setState({files, currentUploading}, () => {
            this.uploadSign();
        });
    };

    uploadSign = () => {
        let {currentUploading} = this.state;

        FileManagerHelper.upload(this.context,
            `${currentUploading.prefix}/${currentUploading.file.name}`,
            currentUploading.file,
            (signUrl) => {
                console.log("upload success", signUrl);
                this.upload(signUrl);
            },
            (errorMessage) => {
                console.log("upload error", errorMessage);
        });
    };

    upload = (signUrl) => {
        let {currentUploading} = this.state;

        let formData = new FormData();

        // Object.keys(signData.fields).forEach(key => {
        //     formData.append(key, signData.fields[key]);
        // });

        formData.append("file", currentUploading.file);

        const cancelTokenSource = axios.CancelToken.source();
        currentUploading.cancelTokenSource = cancelTokenSource;

        axios.put(signUrl, currentUploading.file, {
            headers: {
                "x-amz-acl": "public-read",
                "Content-Type": currentUploading.file.type
            },
            onUploadProgress: this.onUploadProgress,
            cancelToken: cancelTokenSource.token
        })
        .then((response) => {
            console.log("upload response", response)
            this.props.onSingleFileUploaded(currentUploading);
            console.log("upload response2")
            this.next();
        }).then(() => {
            console.log("upload finish");
        })
        .catch(() => {
            console.log("upload Error ...")
        });
    }

    onUploadProgress = (e) => {
        let {currentUploading} = this.state;
        currentUploading.progress = Math.round((100 * e.loaded) / e.total);
        console.log("upload progress", currentUploading.progress)
        this.setState({currentUploading});
    }

    cancelCurrent = () => {
        let {currentUploading} = this.state;
        currentUploading.cancelTokenSource.cancel();
        currentUploading.status = "canceled";

        this.next();
    }

    cancelPendings = (fileData) => {
        let {files} = this.state;
        files = [...files];

        if (fileData.cancelTokenSource)
            this.cancelCurrent();

        let index = files.findIndex(f => {
            return f.file === fileData.file;
        });

        files.splice(index, 1);

        this.setState({files});
    }

    cancelAll = () => {
        let {files} = this.state;
        files = [...files];

        files.forEach(f => {
            this.cancelPendings(f);
        });

        this.cancelCurrent();
    }

    render () {
        let {currentUploading, files} = this.state;
        console.log("files", files)
        return (
            <>
                <div className="FileUploaderRoot">
                    {
                        currentUploading &&
                        <div className="FileUploaderCurrentBorder">
                            <span className="FileUploaderCurrentName">{currentUploading.file.name}</span>
                            <div className="FileUploaderCurrentRoot">
                                <LinearProgress className="FileUploaderCurrentProgress"
                                                key={currentUploading.file.name}
                                    variant="determinate" value={currentUploading.progress}/>
                                <span  className="FileUploaderCurrentLabel">{`${currentUploading.progress}%`}</span>
                                <IconButton
                                    className="FileUploaderCurrentCancel"
                                    onClick={this.cancelCurrent}
                                >
                                    <img
                                        draggable={false}
                                        width={8}
                                        height={8}
                                        src={require('../../../icons/close.svg')}
                                    />
                                </IconButton>
                            </div>
                        </div>
                    }
                    {
                        files.slice(0, 3).map(fileData => {
                            return (
                                <div key={fileData.file.name} className="FileUploaderCurrentBorder FileUploaderPendingRoot">
                                    <span className="FileUploaderCurrentName">{fileData.file.name}</span>
                                    <IconButton
                                        className="FileUploaderCurrentCancel"
                                        onClick={(e) => {this.cancelPendings(fileData)}}
                                    >
                                        <img
                                            draggable={false}
                                            width={8}
                                            height={8}
                                            src={require('../../../icons/close.svg')}
                                        />
                                    </IconButton>
                                </div>
                            )
                        })
                    }
                    {
                        files.slice(3, files.length).length > 0 &&
                        <div className="FileUploaderCurrentBorder">
                            <span className="FileUploaderCurrentName">
                                {
                                    `${files.slice(3, files.length).length} other files are pending ...`
                                }
                            </span>
                            <div className="FileUploaderCurrentCancelAll">
                                <IconButton
                                    className="FileUploaderCurrentCancel"
                                    onClick={this.cancelAll}
                                >
                                    Cancel All
                                </IconButton>
                            </div>
                        </div>
                    }
                </div>
            </>
        )
    }
}
