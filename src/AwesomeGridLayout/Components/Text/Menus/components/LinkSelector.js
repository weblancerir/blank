import React from "react";
import TextEditorButton from "../TextEditorButton";
import {EditorContext} from "../../../../Editor/EditorContext";
import ThemeColorPicker from "../../../../Test/Theme/ThemeColorPicker";
import LinkGenerator from "./LinkGenerator";

export default class LinkSelector extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);

        this.state = {};

        this.buttonRef = React.createRef();
    }

    handleChangeComplete = (linkData) => {
        this.props.onChange(linkData);
    };

    render () {
        return (
            <>
                <TextEditorButton
                    rootRef={this.buttonRef}
                    onClick={(e) => {
                        this.setState({open: true})
                    }}
                    selected={this.props.selected}
                >
                    {this.props.children}
                </TextEditorButton>

                {
                    this.state.open &&
                    <LinkGenerator
                        onClose={(e) => {
                            this.setState({open: false})
                        }}
                        onChangeComplete={ this.handleChangeComplete }
                        editor={this.context.editor}
                    />
                }
            </>
        )
    }
}
