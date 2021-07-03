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
    }

    componentWillUnmount () {
        this.mounted = false;
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        console.log("PageRouterComponent shouldComponentUpdate", this.props.location.pathname,
            nextProps.location.pathname, this.props.pageName, nextProps.pageName);
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

    redirect = (redirectPath, redirectProps) => {
        let {siteData, pageData, setPageData} = this.props;
        console.log("redirect 1", redirectPath, redirectProps);

        if (`/${pageData.props.pageName.toLowerCase()}` === redirectPath) {
            this.redirectPath = redirectPath;
            console.log("redirect 2", redirectPath, redirectProps);
            this.setState({reload: true, redirectProps});
        } else {
            let page = Object.values(siteData.allPages).find(pageData => {
                return pageData.props.isHome;
            });

            if (!page)
                page = getHomePage(siteData);

            setPageData(page.props.pageId, false, () => {
                this.redirectPath = redirectPath;
                console.log("redirect 3", redirectPath, redirectProps);
                this.setState({reload: true, redirectProps});
            })
        }
    };

    render () {
        let {siteData, pageData, pageName} = this.props;

        console.log("RouterPath", this.props.location, !!pageData, pageName);

        if (this.redirectPath) {
            let redirectPath = this.redirectPath;
            delete this.redirectPath;
            return <Redirect to={{
                pathname: redirectPath,
                state: { from: this.props.location.pathname }
            }}
            />
        }

        // if (pageName && (`/${pageName.toLowerCase()}` !== this.props.location.pathname)) {
        //     window.requestAnimationFrame(() => {
        //         this.redirect(this.props.location.pathname);
        //     })
        // }

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
                                state: { from: "/" }
                            }}
                        />
                    </Route>
                }
            </Switch>
        )
    }
}

const MainRouter = withRouter(props =>
    <PageRouterComponent ref={props.routerRef} {...props}/>
);

const PageRouter = (props) => {
    return (
        <Router basename={'application'}>
            <MainRouter {...props}/>
        </Router>
    )
}

export default PageRouter;
