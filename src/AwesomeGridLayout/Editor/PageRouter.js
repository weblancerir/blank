import React from "react";
import {EditorContext} from "./EditorContext";
import {
    Switch,
    Route, Redirect
} from "react-router-dom";
import {BrowserRouter as Router, withRouter} from 'react-router-dom';
import {getHomePage} from "../MenuManager/MenuManager";
import {shallowEqual} from "../AwesomeGridLayoutUtils";

class PageRouterComponent extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);

        this.firstLoad = true;

        console.log("PageRouterComponent constructor");
    }

    componentDidMount () {
        this.mounted = true;
    }

    componentWillUnmount () {
        this.mounted = false;
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (!shallowEqual(JSON.stringify(this.props.location), JSON.stringify(nextProps.location))) {
            console.log("Router shouldComponentUpdate", true);
            return true;
        }

        // if (this.changingPage) {
        //     this.changingPage = false;
        //     return true;
        // }

        console.log("Router shouldComponentUpdate", false);
        return false;
    }

    isPageChanged = () => {
        let {pageData, siteData} = this.context;
        let currentPath = this.props.location.pathname;

        if (this.firstLoad) {
            this.firstLoad = false;

            let page = Object.values(siteData.allPages).find(pageData => {
                return pageData.props.pageId;
            });
            if (!page)
                page = getHomePage(siteData);

            console.log("Router firstLoad");

            this.context.setPageData(page.props.pageId, true, () => {
                console.log("Router firstLoad forceUpdate");
                this.forceUpdate();
            });

            // this.changingPage = true;

            return {
                changed: true,
                newPath: currentPath
            }
        }

        let newPath = `/${pageData.props.pageName.toLowerCase()}`;

        let changed = (newPath !== currentPath.toLowerCase());

        if (changed)
            this.props.history.push(newPath);

        return {changed, newPath}
    }

    render () {
        let {siteData, pageData} = this.context;

        if (!pageData)
            return null;

        console.log("RouterPath", this.props.location.pathname, pageData.props.pageName);

        let {changed, newPath} = this.isPageChanged();
        if (changed) {
            console.log("RouterPath changed", newPath);
            if (newPath){
                return <Redirect to={{
                    pathname: newPath,
                    // state: { from: this.props.location.pathname }
                }}
                />
            } else {
                return null;
            }
        }
        return (
            <Switch>
                {
                    Object.values(siteData.allPages).map(page => {
                        console.log("Routes", `/${page.props.pageName}`)
                        return (
                            <Route path={`/${page.props.pageName}`} key={page.props.pageName}>
                                {this.props.children}
                            </Route>
                        )
                    })
                }

                <Route path={`/`}>
                    <Redirect
                        to={{
                            pathname: `/${getHomePage(siteData).props.pageName}`,
                            state: { from: "/" }
                        }}
                    />
                </Route>
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
