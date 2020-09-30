import React from "react";
import './ThemeManager.css';
import IconButton from "../../HelperComponents/IconButton";
import Image from "../../Menus/CommonComponents/Image";
import {EditorContext} from "../../Editor/EditorContext";

export default class ThemeTextItem extends React.Component {
    static contextType = EditorContext;

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
        let {item} = this.props;
        let {siteData} = this.context;
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
                    <img
                        draggable={false}
                        width={16}
                        height={16}
                        src={process.env.PUBLIC_URL + '/static/icon/edit.svg'}
                    />
                </IconButton>
            </div>
        )
    }
}
