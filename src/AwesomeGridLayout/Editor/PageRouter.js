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

        console.log("Router shouldComponentUpdate", false);
        return false;
    }

    isPageChanged = () => {
        let {pageData} = this.context;
        let currentPath = this.props.location.pathname;
        let oldPath = `/${pageData.props.pageName.toLowerCase()}`;

        let changed = (oldPath !== currentPath.toLowerCase());

        if (changed)
            this.props.history.push(oldPath);

        return changed
    }

    render () {
        let {siteData, pageData} = this.context;
        console.log("RouterPath", this.props.location.pathname);

        if (this.isPageChanged()) {
            return <Redirect to={{
                pathname: `/${pageData.props.pageName}`,
                // state: { from: this.props.location.pathname }
            }}
            />
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
                {/*<Route path={`/Test`} render={(props) => {*/}
                {/*    return (*/}
                {/*        this.props.children*/}
                {/*    )*/}
                {/*}}>*/}
                {/*</Route>*/}

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
