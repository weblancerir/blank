import React from "react";
import TextEditorButton from "../TextEditorButton";
import {EditorContext} from "../../../../Editor/EditorContext";
import ThemeColorPicker from "../../../../Test/Theme/ThemeColorPicker";

export default class TextColorSelector extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);

        this.state = {};

        this.buttonRef = React.createRef();
    }

    handleChangeComplete = (color) => {
        this.props.onChange(color);
    };

    render () {
        return (
            <>
                <TextEditorButton
                    rootRef={this.buttonRef}
                    onClick={(e) => {
                        this.setState({open: true})
                    }}
                >
                    {this.props.children}
                </TextEditorButton>

                {
                    this.state.open &&
                    <ThemeColorPicker
                        onClose={(e) => {
                            this.setState({open: false})
                        }}
                        onChangeComplete={ this.handleChangeComplete }
                        disableAlpha
                        editor={this.context.editor}
                        defaultPosition={
                            this.buttonRef.current.getBoundingClientRect()
                        }
                    />
                }
            </>
        )
    }
}
