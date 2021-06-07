import React from "react";
import {EditorContext} from "../../../Editor/EditorContext";
import FileManagerHelper from "../FileManagerHelper";
import axios from "axios";
import './FileUploader.css';

export default class FileUploader extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);

        this.state = {
            files: props.files.map(f => {return {
                file: f,
                status: "pending",
                progress: 0,
                prefix: props.prefix
            }})
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

        const xhr = new XMLHttpRequest();
        xhr.open('PUT', signUrl);
        xhr.setRequestHeader('Content-Type', currentUploading.file.type);
        xhr.setRequestHeader('x-amz-acl', 'public-read');
        xhr.send({uri: currentUploading.file.uri, type: currentUploading.file.type, name: currentUploading.file.fileName});

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                let percentComplete = event.loaded / event.total;
                //Update the state and display it to the user
                console.log("upload progress", percentComplete)
            } else {}
        });

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    console.log('Image successfully uploaded to S3');
                } else {
                    console.log('Error while sending the image to S3')
                }
            }
        }
        // let formData = new FormData();

        // Object.keys(signData.fields).forEach(key => {
        //     formData.append(key, signData.fields[key]);
        // });

        // formData.append("file", currentUploading.file);

        // axios.put(signUrl, formData, {
        //     headers: {
        //         "Content-Type": "multipart/form-data",
        //         "Access-Control-Allow-Origin": "*"
        //     },
        //     onUploadProgress: this.onUploadProgress,
        // })
        // axios({
        //     method: 'PUT',
        //     url: signUrl,
        //     body: formData,
        //     headers: {
        //         "x-amz-acl": "public-read",
        //         "Content-Type": currentUploading.file.type
        //     }
        // })
        //     .then((response) => {
        //     console.log("upload response", response)
        // }).then((files) => {
        //     console.log("upload files", files)
        // })
        // .catch(() => {
        //     console.log("upload Error ...")
        // });
    }

    onUploadProgress = (e) => {
        let {currentUploading} = this.state;
        currentUploading.progress = Math.round((100 * e.loaded) / e.total);
        console.log("upload progress", currentUploading.progress)
        this.setState({currentUploading});
    }

    render () {
        return (
            <>
                <div className="FileUploaderRoot">
                    Uploader
                </div>
            </>
        )
    }
}
