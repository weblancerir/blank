import React from "react";
import './ThemeManager.css';
import {sortBy} from "../../AwesomwGridLayoutHelper";
import IconButton from "../../HelperComponents/IconButton";
import Image from "../../Menus/CommonComponents/Image";

export default class ThemeTextItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    onEditClick = (e) => {

    };

    render() {
        let {siteData, pageData, editor, item} = this.props;
        if (!siteData)
            return null;

        return (
            <div className="ThemeTextItemRoot">
                <span className="ThemeTextItemName">
                    {item.name}
                </span>
                <span className="ThemeTextItemDetail">
                    {item.font}, {item.fontSize}px
                </span>
                <span style={{
                    fontFamily: `${item.font} Arial`,
                    fontWeight: item.fontWeight,
                    fontStyle: item.fontStyle,
                    fontSize: Math.min(item.fontSize, 40),
                    color: item.color,
                    lineHeight: '1.4em'
                }}>
                    For Bold Creators
                </span>

                <IconButton
                    className="ThemeTextItemEdit"
                    onClick={this.onEditClick}
                >
                    <Image
                        width={16}
                        height={16}
                        src={'static/icon/edit.svg'}
                    />
                </IconButton>
            </div>
        )
    }
}
