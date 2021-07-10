import React from "react";
import {EditorContext} from "../../EditorContext";
import './SiteSetting.css';
import Button from "@material-ui/core/Button/Button";
import ReactLoading from "react-loading";
import UploadButton from "../../../Components/FileManager/Components/UploadButton";
import FileManagerHelper from "../../../Components/FileManager/FileManagerHelper";
import {getRandomLinkId} from "../../../Components/Text/TextHelper";
import Confirm from "../Components/Confirm";

export default class SiteSetting extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);
        this.state = {
            loading: false
        };
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    onRename = (e) => {
        this.newName = e.target.value;
    }

    onRenameClicked = () => {
        if (this.newName.length < 3) {
            this.context.postMessageToHolder(
                {
                    type: "Holder",
                    func: "showSnackbar",
                    inputs: ['Name must have at least 3 character']
                });
            return;
        }

        let {website} = this.context;

        this.setState({loading: true});
        this.context.postMessageToHolder(
            {
                type: "Server",
                route: "/website",
                input: {id: website.id, name: this.newName},
                method: "put"
            },
            ({result}) => {
                if (result.success) {
                    this.setState({loading: false});
                    website.name = this.newName;
                    this.context.postMessageToHolder(
                        {
                            type: "Holder",
                            func: "showSnackbar",
                            inputs: ['Name changed successfully', 'success']
                        });
                }
                else
                {
                    this.setState({loading: false});
                    this.context.postMessageToHolder(
                        {
                            type: "Holder",
                            func: "showSnackbar",
                            inputs: ["Can't change website name", 'error']
                        });
                }
            });
    }

    checkValidation = (type) => {
        if (!type)
            return true;

        switch (type.toLowerCase()) {
            case "name": {
                let {website} = this.context;

                if (this.newName === undefined)
                    this.newName = website.name;

                if (this.newName.length < 3) {
                    this.context.postMessageToHolder(
                        {
                            type: "Holder",
                            func: "showSnackbar",
                            inputs: ['Name must have at least 3 character', 'warning']
                        });
                    return false;
                }
                if (this.newName === website.name)
                    return false;
                break;
            }
            case "description": {
                let {website} = this.context;

                if (this.newDescription === undefined)
                    this.newDescription = website.description;

                if (this.newDescription.length < 3) {
                    this.context.postMessageToHolder(
                        {
                            type: "Holder",
                            func: "showSnackbar",
                            inputs: ['Description must have at least 3 character', 'warning']
                        });
                    return false;
                }
                if (this.newDescription === website.description)
                    return false;
                break;
            }
        }

        return true;
    }

    getSuccessMessage = (type) => {
        if (!type)
            return true;

        switch (type.toLowerCase()) {
            case "name":
                return "Name changed successfully"
            case "description":
                return "Description changed successfully"
        }

        return true;
    }

    onWebsiteChange = (type, paramChange, onSuccess) => {
        if (!this.checkValidation(type)) {
            return;
        }

        let {website} = this.context;

        this.setState({loading: true});
        this.context.postMessageToHolder(
            {
                type: "Server",
                route: "/website",
                input: {id: website.id, ...paramChange},
                method: "put"
            },
            ({result}) => {
                if (result.success) {
                    this.setState({loading: false});
                    onSuccess && onSuccess();
                    this.context.postMessageToHolder(
                        {
                            type: "Holder",
                            func: "showSnackbar",
                            inputs: [this.getSuccessMessage(type), 'success']
                        });
                }
                else
                {
                    this.setState({loading: false});
                    this.context.postMessageToHolder(
                        {
                            type: "Holder",
                            func: "showSnackbar",
                            inputs: [result.message, 'error']
                        });
                }
            });
    }

    uploadFavIcon = (file) => {
        this.setState({loading: true});
        FileManagerHelper.storage(this.context, ({url}) => {
            let baseUrl = url;
            FileManagerHelper.list(this.context, "", undefined, (list, prefix) => {
                let basePrefix = list.basePrefix;
                let postHash = getRandomLinkId(5);
                FileManagerHelper.fullUpload(
                    this.context, "favIcons/favIcon" + postHash, file, () => {

                        let {siteData, website} = this.context;

                        siteData.setting.favIconLink = `${baseUrl}/${basePrefix}/favIcons/favIcon` + postHash;

                        this.context.postMessageToHolder(
                            {
                                type: "Holder",
                                func: "saveWebsite",
                                inputs: [true]
                            }, (success) => {
                                this.setState({loading: false});

                                this.context.postMessageToHolder(
                                    {
                                        type: "Holder",
                                        func: "showSnackbar",
                                        inputs: ['Fav icon uploaded successfully', 'success']
                                    });
                            });
                    }, (e, cancelTokenSource) => {

                    }, (errorMessage) => {
                        this.setState({loading: false});
                        console.log("uploadFavIcon error", errorMessage)
                    }
                )
            }, (errorMessage) => {
                this.setState({loading: false});
                console.log("storage error", errorMessage);
            });
        }, (errorMessage) => {
            this.setState({loading: false});
            console.log("storage error", errorMessage);
        });
    }

    deleteWebsite = () => {
        this.onWebsiteChange(undefined, {archive: "hidden"}, () => {
            this.context.postMessageToHolder({
                type: "Holder",
                func: "closeHolder",
                inputs: []
            });
        });
    }

    render() {
        let {siteData, website} = this.context;
        let isPublished = website.metadata.isPublished;
        return (
            <div className="SitSettingRoot">
                <div className="SitSettingMainRoot">
                    <div className="SitSettingNameRoot">
                        <span className="SitSettingNameTitle">
                            Website Name
                        </span>
                        <span className="SitSettingNameDesc">
                            You can change your website name only before publishing your website for first time.
                        </span>

                        <input
                            defaultValue={isPublished? undefined: website.name}
                            className="NumberInput PageManagerRenameInput PageInfoNameInput SitSettingNameInput"
                            type="text"
                            onChange={this.onRename}
                            value={isPublished? website.name: undefined}
                        >
                        </input>

                        {
                            !isPublished &&
                            <Button className="SitSettingNameButton" variant="contained" color="primary"
                                    onClick={() => {
                                        this.onWebsiteChange(
                                            "name", {
                                                name: this.newName
                                            }, () => {
                                                website.name = this.newName;
                                            }
                                        );
                                    }}
                            >
                                Change Name
                            </Button>
                        }
                    </div>
                    <div className="SitSettingNameRoot">
                        <span className="SitSettingNameTitle">
                            Website Description
                        </span>
                        <span className="SitSettingNameDesc">
                            A description to describe your website ti you and your colleagues
                        </span>

                        <input
                            defaultValue={website.description}
                            className="NumberInput PageManagerRenameInput PageInfoNameInput SitSettingNameInput"
                            type="text"
                            onChange={(e) => {
                                this.newDescription = e.target.value;
                            }}
                        >
                        </input>

                        <Button className="SitSettingNameButton" variant="contained" color="primary"
                                onClick={() => {
                                    this.onWebsiteChange(
                                        "description", {
                                            description: this.newDescription
                                        }, () => {
                                            website.description = this.newDescription;
                                        }
                                    );
                                }}
                        >
                            Change Description
                        </Button>
                    </div>
                    <div className="SitSettingFavRoot">
                        <div className="SitSettingFavLeft">
                             <span className="SitSettingNameTitle">
                            Website Fav Icon
                        </span>
                            <span className="SitSettingNameDesc">
                            Fav icon shown on browser tab for your website
                        </span>

                            <UploadButton
                                className="SitSettingFavIconUploader"
                                onFileSelected={(e) => {
                                    this.uploadFavIcon(Object.values(e.target.files).map(file => {
                                        return file;
                                    })[0])
                                }}
                                accept={
                                    [
                                        "jpg", "jpeg", "png",
                                        "gif", "jpe", "jfif",
                                        "bmp", "heic", "heif",
                                        "tiff", "tif", "svg",
                                        "tiff", "tif", "png",
                                        "tiff", "tif", "webp"
                                    ]
                                }
                            >
                                Upload Fav Icon
                            </UploadButton>
                        </div>

                        {
                            siteData.setting.favIconLink &&
                            <img
                                className="SitSettingFavRight"
                                draggable={false} width={100} height={100}
                                 src={siteData.setting.favIconLink}
                            />
                        }
                    </div>
                    <div className="SitSettingNameRoot SitSettingLastRoot">
                        <span className="SitSettingNameTitle">
                            Delete Website
                        </span>
                        <span className="SitSettingNameDesc">
                            Delete your website to hide from your dashboard. you can't rollback this action without calling weblancer operator
                        </span>

                        <Button className="SitSettingNameButton" variant="contained" color="primary"
                                onClick={() => {
                                    this.setState({deleteConfirm: true})
                                }}
                        >
                            Delete Website
                        </Button>
                    </div>
                </div>

                {
                    this.state.loading &&
                    <div className="MainLoading">
                        <ReactLoading type={'bubbles'}
                                      color={"#7cfdf7"}
                                      height={'85px'}
                                      width={'85px'}
                        />
                    </div>
                }

                {
                    this.state.deleteConfirm &&
                    <Confirm
                        onClose={() => {this.setState({deleteConfirm: false})}}
                        title={"Alert !!!"}
                        message={"Are you sure about deleting this website ?!"}
                        onYes={this.deleteWebsite}
                    />
                }
            </div>
        )
    }
}
