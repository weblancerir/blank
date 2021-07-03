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
    static contextType = EditorContext;

    constructor(props) {
        super(props);

        this.firstLoad = true;

        console.log("PageRouterComponent constructor");
    }

    componentDidMount () {
        this.mounted = true;
        this.props.history.listen((newLocation, action) => {
            console.log("listen", newLocation, action);
            if (action === "POP") {
                this.props.history.push({
                    pathname: this.oldPath,
                });
            }
            // } else {
            //     // If a "POP" action event occurs,
            //     // Send user back to the originating location
            //     history.go(1);
            // }
        });
    }

    componentWillUnmount () {
        this.mounted = false;
    }

    isPageChanged = () => {
        let {pageData, siteData} = this.context;
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

        if (changed) {
            // this.props.history.push(currentPath);
            console.log("Router changed history", this.props.history, this.props.history.entries, currentPath);
            this.props.history.replace(currentPath.toLowerCase(), {state: { deleted : true }}) // false
        }

        this.oldPath = currentPath.toLowerCase();
        return {changed, newPath, oldPath: currentPath.toLowerCase()}
    }

    render () {
        let {siteData, pageData} = this.context;

        if (!pageData)
            return null;

        console.log("RouterPath", this.props.location, pageData.props.pageName);

        let {changed, newPath, oldPath} = this.isPageChanged();
        if (changed) {
            console.log("RouterPath changed", newPath, oldPath);
            if (newPath){
                return (
                    <Redirect to={{ pathname: newPath}}
                              push={false} />
                )
            } else {
                return null;
            }
        }
        console.log("RouterPath final", this.props.location);
        return (
            <Switch>
                {
                    Object.values(siteData.allPages).map(page => {
                        console.log("Routes", `/${page.props.pageName.toLowerCase()}`)
                        return (
                            <Route path={`/${page.props.pageName.toLowerCase()}`} key={page.props.pageName}>
                                {this.props.children}
                            </Route>
                        )
                    })
                }

                <Route path={`/`}>
                    <Redirect
                        to={{
                            pathname: `/${getHomePage(siteData).props.pageName.toLowerCase()}`,
                            // state: { from: "/" }
                        }}
                        push={false}
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
