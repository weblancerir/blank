import React from "react";
import {EditorContext} from "./EditorContext";
import {
    Switch,
    Route, Redirect
} from "react-router-dom";
import {BrowserRouter as Router, withRouter} from 'react-router-dom';
// import {Router, withRouter} from 'react-router-dom';
import {getHomePage} from "../MenuManager/MenuManager";

class PageRouterComponent extends React.Component {
    // static contextType = EditorContext;

    constructor(props) {
        super(props);

        this.firstLoad = true;

        console.log("PageRouterComponent constructor");
    }

    componentDidMount () {
        this.mounted = true;
        window.onpopstate = (e)=> {
            if(this.mounted) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Back", this.props.location, this.changingPage)
                if (this.changingPage) {
                    this.changingPage = false;
                    this.props.history.goBack(1);
                } else {
                    this.backClicked = true;
                }
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        console.log("PageRouterComponent shouldComponentUpdate", this.props.location.pathname,
            this.props.location.search, this.props.pageName, nextProps.pageName);
        if (this.props.location.pathname !== nextProps.location.pathname ||
            this.props.location.search !== nextProps.location.search ||
            this.props.pageName !== nextProps.pageName)
        {
            console.log("PageRouterComponent shouldComponentUpdate", true);
            return true;
        }

        console.log("PageRouterComponent shouldComponentUpdate", false);
        return false;
    }

    componentWillUnmount () {
        this.mounted = false;
    }

    isPageChanged = () => {
        let {pageData, siteData} = this.props;

        if (!pageData)
            return {changed: false};

        console.log("Router isPageChanged", this.props.location);
        let currentPath = (this.props.location.location || this.props.location).pathname;

        if (this.firstLoad) {
            this.firstLoad = false;

            let page = Object.values(siteData.allPages).find(pageData => {
                return `/${pageData.props.pageName.toLowerCase()}` === currentPath.toLowerCase();
            });
            if (!page)
                page = getHomePage(siteData);

            console.log("Router firstLoad");

            this.props.setPageData(page.props.pageId, true, () => {
                console.log("Router firstLoad forceUpdate");
                this.forceUpdate();
            });

            this.changingPage = true;

            return {
                changed: true,
                newPath: currentPath
            }
        }

        let newPath;
        let oldPath
        if (this.backClicked) {
            this.backClicked = false;
            newPath = currentPath.toLowerCase();
            let page = Object.values(siteData.allPages).find(pageData => {
                return `/${pageData.props.pageName.toLowerCase()}` === newPath;
            });
            this.props.setPageData(page.props.pageId, true);
            return {changed: false}
        }
        else
        {
            newPath = `/${pageData.props.pageName.toLowerCase()}`;
            oldPath = currentPath.toLowerCase();
        }

        let changed = (newPath !== oldPath);

        if (changed) {
            this.changingPage = true;
        }

        return {changed, newPath, oldPath}
    }

    render () {
        // let {siteData, pageData} = this.context;
        let {siteData, pageData} = this.props;

        console.log("RouterPath", this.props.location, !!pageData);
        // if (!pageData)
        //     return null;

        let {changed, newPath, oldPath} = this.isPageChanged();
        if (changed) {
            console.log("RouterPath changed", newPath, oldPath);
            if (newPath){
                return (
                    <Redirect to={{ pathname: newPath}}
                              push={true} />
                )
            } else {
                return null;
            }
        }
        console.log("RouterPath final", this.props.location);
        return (
            <Switch>
                {
                    siteData && Object.values(siteData.allPages).map(page => {
                        console.log("Routes", `/${page.props.pageName.toLowerCase()}`)
                        return (
                            <Route exact path={`/${page.props.pageName.toLowerCase()}`} key={page.props.pageName}>
                                {this.props.children}
                            </Route>
                        )
                    })
                }

                {
                    siteData &&
                    <Route exact path={`/`}>
                        <Redirect
                            to={{
                                pathname: `/${getHomePage(siteData).props.pageName.toLowerCase()}`,
                                // state: { from: "/" }
                            }}
                            push={false}
                        />
                    </Route>
                }
            </Switch>
        )
    }
}

const MainRouter = withRouter(props =>
    <PageRouterComponent {...props}/>
);

const PageRouter = (props) => {
    return (
        <Router basename={'application'}>
            <MainRouter {...props}/>
        </Router>
    )
}

export default PageRouter;
