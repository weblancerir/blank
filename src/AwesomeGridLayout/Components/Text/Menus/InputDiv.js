import React from "react";
import {getInheritTextStyle} from "../TextHelper";

export default class InputDiv extends React.Component {
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return false;
    }

    render () {
        let {tag, textStaticData} = this.props;
        let TextTag = tag;
        return (
            <TextTag
                id={"editableDiv"}
                key={'textEditor'}
                ref={this.props.textareaRef}
                contentEditable={true}
                style={{...{
                    width: "100%",
                    boxSizing: "border-box",
                    margin: 0,
                    height: "auto",
                    overflow: "hidden",
                    display: "inline-block",
                    whiteSpace: 'pre-wrap'
                }, ...getInheritTextStyle()}}
                dangerouslySetInnerHTML={{ __html: this.props.value }}
            >
            </TextTag>
        )
    }
}
