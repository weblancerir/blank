import React from "react";
import './PageManager.css';
import IconButton from "../../HelperComponents/IconButton";
import Image from "../../Menus/CommonComponents/Image";
import ButtonBase from "@material-ui/core/ButtonBase/ButtonBase";
import PageTypeTitle from "./PageTypeTitle";
import PageItem from "./PageItem";
import AddNewPageDialog from "./AddNewPageDialog";
import {v4 as uuidv4} from "uuid";
import {EditorContext} from "../../Editor/EditorContext";

export default class PageManager extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);
        this.state = {
            percent: props.open ? 100 : 0,
            openNormalPage: true,
            openDynamicPage: false
        };

        this.opening = false;
        this.closing = false;
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }



    open = () => {
        this.opening = true;
        clearInterval(this.closeInterval);
        clearInterval(this.openInterval);
        this.setState({ open: true});
        this.openInterval = setInterval(() => {
            if (!this.mounted) {
                clearInterval(this.openInterval);
                return;
            }
            let percent = this.state.percent += (this.props.speed * this.props.interval / 1000);
            if (percent >= 100) {
                this.opening = false;
                clearInterval(this.openInterval);
            }
            percent = Math.min(100, percent);
            this.setState({percent});
        }, this.props.interval);
    };

    close = (force) => {
        this.closing = true;
        clearInterval(this.closeInterval);
        clearInterval(this.openInterval);
        this.setState({ open: false});
        if (force) {
            this.setState({percent: 0});
            return;
        }
        this.closeInterval = setInterval(() => {
            if (!this.mounted) {
                clearInterval(this.closeInterval);
                return;
            }
            let percent = this.state.percent -= (this.props.speed * this.props.interval / 1000);
            if (percent <= 0) {
                this.closing = false;
                clearInterval(this.closeInterval);
            }
            percent = Math.max(0, percent);
            this.setState({percent});
        }, this.props.interval);
    };

    toggle = (force) => {
        let toggleState = !this.state.open;
        this.state.open ? this.close(force) : this.open();

        return toggleState;
    };

    onChangeSearch = (e) => {
        let searchValue = e.target.value;
        this.setState({searchValue});
    };

    getFilteredPages = () => {
        let {siteData} = this.context;
        return Object.keys(siteData.allPages).filter(siteId => {
            if (!this.state.searchValue)
                return true;

            let pageData = siteData.allPages[siteId];

            return pageData.props.pageName.toLowerCase().includes(this.state.searchValue.toLowerCase());
        }).map(siteId => {
            return siteData.allPages[siteId];
        });
    };

    onPageClick = (pageData) => {
        this.context.setPageData(pageData.props.pageId);
    };

    onAddNormalPage = () => {
        let {siteData} = this.context;

        if (!this.props.newPageDataUrl) {
            fetch('/static/json/newPageData.json')
                .then((r) => r.json())
                .then((pageData) =>{
                    let newName = "New Page";
                    let newId = uuidv4();

                    pageData.props.pageName = newName;
                    pageData.props.pageId = newId;

                    siteData.allPages[newId] = pageData;

                    this.onPageClick(siteData.allPages[newId]);
                });
            // return;
        }
    };

    onAddDynamicPage = (data) => {
        // TODO
    };

    render() {
        let {siteData} = this.context;

        if (!siteData)
            return null;

        return (
            <>
                <div
                    className="PageManagerRoot"
                    style={{
                        left: `${this.state.percent - 100}%`,
                        opacity: this.state.percent / 100
                    }}
                    onContextMenu={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >
                    {/*Header*/}
                    <div className="PageManagerHeader">
                        <div
                            className="PageManagerHeaderContainer"
                        >
                            <span className="PageManagerHeaderTitle">
                                Site Pages
                            </span>

                            <IconButton
                                onClick={() => {
                                    this.context.toggleRightMenu("pageManager", false);
                                }}
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

                    {/*Search box*/}
                    <div className="PageManagerSearchBox">
                        <input
                            className="NumberInput PageManagerSearchInput"
                            type="text"
                            onChange={this.onChangeSearch}
                        >
                        </input>

                        <Image
                            className="PageManagerSearchImage"
                            src={'static/icon/search.svg'}
                        />
                    </div>

                    {/*Sites list*/}

                    <PageTypeTitle
                        defaultOpen={this.state.openNormalPage}
                        title="Main Pages" onChange={(openNormalPage) => {
                        this.setState({openNormalPage});
                    }}/>

                    <div className="PageManagerNormalPageList">
                        {
                            this.state.openNormalPage &&
                            this.getFilteredPages().map(pageData => {
                                return (
                                    <PageItem
                                        key={pageData.props.pageId}
                                        pageData={pageData}
                                        onClick={(e) => {
                                            this.onPageClick(pageData);
                                        }}
                                        editor={this.props.editor}
                                    />
                                )
                            })
                        }
                    </div>


                    <ButtonBase className="PageManagerAddPageButton"
                        onClick={(e) => {
                            this.setState({showAddPage: e.target})
                        }}
                    >
                        Add New Page
                    </ButtonBase>

                    {
                        this.state.showAddPage &&
                        <AddNewPageDialog
                            anchorEl={this.state.showAddPage}
                            open={this.state.showAddPage !== undefined}
                            onClose={(e) => {
                                this.setState({showAddPage: undefined})
                            }}
                            onAddDynamicPage={this.onAddDynamicPage}
                            onAddNormalPage={this.onAddNormalPage}
                        />
                    }
                </div>
            </>
        )
    }
}

PageManager.defaultProps = {
    open: false,
    speed: 800,
    interval: 5
};
