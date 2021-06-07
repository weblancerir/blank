import React from "react";
import {EditorContext} from "../../../Editor/EditorContext";
import ButtonBase from "@material-ui/core/ButtonBase/ButtonBase";

export default class UploadButton extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);

        this.inputRef = React.createRef();
    }

    render () {
        return (
            <>
                <input
                    style={{display: "none"}}
                    type="file" name="file" onChange={this.props.onFileSelected} ref={this.inputRef}
                    multiple={this.props.multiple}
                />
                <div>
                    <ButtonBase
                        className={this.props.className}
                        style={this.props.style}
                        onClick={(e) => {
                            this.inputRef.current.click();
                        }}
                    >
                        {this.props.children}
                    </ButtonBase>
                </div>
            </>
        )
    }
}
