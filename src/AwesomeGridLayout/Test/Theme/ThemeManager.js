import React from "react";
import './ThemeManager.css';
import {getColorScheme, sortBy} from "../../AwesomwGridLayoutHelper";
import ThemeTextItem from "./ThemeTextItem";
import IconButton from "../../HelperComponents/IconButton";
import ThemeColorsItem from "./ThemeColorsItem";

const colorKeys = [
    "1","2","3","4","5",
];
export default class ThemeManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            percent: props.open ? 100 : 0,
            category: sortBy(Object.values(props.siteData.theme), "order")[0],
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
        this.openInterval = setInterval(() => {
            if (!this.mounted) {
                clearInterval(this.openInterval);
                return;
            }
            let percent = this.state.percent += (this.props.speed * this.props.interval / 1000);
            if (percent > 100) {
                this.opening = false;
                clearInterval(this.openInterval);
            }
            percent = Math.min(100, percent);
            this.setState({percent, open: (percent === 100)});
        }, this.props.interval);
    };

    close = (force) => {
        this.closing = true;
        clearInterval(this.closeInterval);
        clearInterval(this.openInterval);
        if (force) {
            this.setState({percent: 0, open: false});
            return;
        }
        this.closeInterval = setInterval(() => {
            if (!this.mounted) {
                clearInterval(this.closeInterval);
                return;
            }
            let percent = this.state.percent -= (this.props.speed * this.props.interval / 1000);
            if (percent < 0) {
                this.closing = false;
                clearInterval(this.closeInterval);
            }
            percent = Math.max(0, percent);
            this.setState({percent, open: (percent !== 0)});
        }, this.props.interval);
    };

    setCategory = (category) => (e) => {
        if (category !== this.state.category)
            this.setState({category});
    };

    calculateTheme = () => {
        let {siteData, pageData, editor} = this.props;

        let theme = siteData.theme;

        if (!theme.Colors.calculated) {
            Object.values(theme.Colors.items).forEach(item => {
                let scheme = getColorScheme(item.main);
                colorKeys.forEach(key => {
                    item[key] = scheme[key];
                })
            });

            theme.Colors.calculated = true;
        }
    };

    getColor = (paletteName, key) => {
        let {siteData, pageData, editor} = this.props;

        let theme = siteData.theme;

        this.calculateTheme();

        return theme.Colors.items[paletteName][key];
    };

    render() {
        let {siteData, pageData, editor} = this.props;
        if (!siteData)
            return null;

        return (
            <>
                <div
                    className="ThemeManagerRoot"
                    style={{
                        left: `${this.state.percent - 100}%`,
                        opacity: this.state.percent / 100
                    }}
                    onContextMenu={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >
                    <div
                        className="ThemeManagerList"
                    >
                        {
                            sortBy(Object.values(siteData.theme), "order").map(category => {
                                let style = {};
                                if (category === this.state.category)
                                    style.backgroundColor = "#e5ffff";
                                return (
                                    <div
                                        key={category.name}
                                        className="ThemeManagerCategoryItem"
                                        onClick={this.setCategory(category)}
                                        style={style}
                                    >
                                        {category.name}
                                    </div>
                                )
                            })
                        }
                    </div>

                    {
                        this.state.category &&
                        <div className="ThemeManagerItemRoot">
                            {/*Header*/}
                            <div
                                className="ThemeManagerItemHeaderContainer"
                            >
                            <span className="ThemeManagerItemHeaderTitle">
                                Theme
                            </span>

                                <IconButton
                                    onClick={this.close}
                                >
                                    <img
                                        draggable={false}
                                        width={12}
                                        height={12}
                                        src={require('../../icons/close.svg')}
                                    />
                                </IconButton>
                            </div>

                            <div className="ThemeManagerItemScroll">
                                {
                                    Object.keys(this.state.category.items).map(key => {
                                        if (this.state.category.name === "Text") {
                                            return (
                                                <ThemeTextItem
                                                    key={key}
                                                    item={this.state.category.items[key]}
                                                    siteData={siteData}
                                                    editor={editor}
                                                />
                                            )
                                        }
                                        if (this.state.category.name === "Colors") {
                                            return (
                                                <ThemeColorsItem
                                                    key={key}
                                                    item={this.state.category.items[key]}
                                                    siteData={siteData}
                                                    pageData={pageData}
                                                    editor={editor}
                                                    recalculateColors={this.calculateTheme()}
                                                />
                                            )
                                        }
                                    })
                                }
                            </div>
                        </div>
                    }
                </div>
            </>
        )
    }
}

ThemeManager.defaultProps = {
    open: false,
    speed: 1200,
    interval: 5
};
