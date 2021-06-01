import React from "react";
import AGLWrapper from "../Helpers/AGLWrapper";
import AGLComponent from "../Helpers/AGLComponent";
import '../../HelperStyle.css';
import './Text.css';
import {
    getCompositeDesignData,
    getFromTempData,
    setDataInBreakpoint,
    setTempData
} from "../../AwesomwGridLayoutHelper";
import TextWrapper from "./TextWrapper";
import {EditorContext} from "../../Editor/EditorContext";

export default class Text extends AGLComponent{
    static contextType = EditorContext;

    constructor (props) {
        super(props);

        this.state = {
            editMode: false
        }

        this.textRef = React.createRef();
    }

    resolveDesignData = () => {
        // resolveDesignData(this, "border", {});
    };

    getDefaultData = () => {
        return {
            bpData: {
                overflowData: {
                    state: "show"
                }
            },
        };
    };

    getPrimaryOptions = () => {
        this.resolveDesignData();
        return [

        ]
    };

    updateDesign = (compositeDesign) => {

    };

    onChange = (e, callback) => {
        if (e) {
            let textStaticData = getFromTempData(this, "textStaticData");
            textStaticData.textValue = e.target.value;
        }

        this.props.select.onScrollItem();
    }

    onEditModeChange = (editMode) => {
        this.setState({editMode});
        this.props.select.onScrollItem();
    }

    onChangeData = (textStaticData, textDesignData) => {
        setTempData("textStaticData", textStaticData, this.getAgl(), true);
        setDataInBreakpoint("design.textDesignData", textDesignData, this.getAgl(), true, undefined, true);
        this.props.select.onScrollItem();
    }

    getStaticChildren = () => {
        this.resolveDesignData();

        let textStaticData = getFromTempData(this, "textStaticData");
        let textDesignData = getCompositeDesignData(this).textDesignData;
        let textTheme = this.context.getTheme("Text", textDesignData.textTheme);

        let rect = {};
        if (this.getAgl()){
            rect = this.getAgl().getSize(false);
        }

        return (
            <TextWrapper
                ref={this.textRef}
                width={rect.width}
                height={rect.height}
                onChange={this.onChange}
                onChangeData={this.onChangeData}
                onEditModeChange={this.onEditModeChange}
                textStaticData={textStaticData}
                textDesignData={textDesignData}
                textTheme={textTheme}
                onThemeChange={this.onThemeChange}
            >
            </TextWrapper>
        )
    };

    onDoubleClickOverride = (agl, e) => {
        if (!this.props.editor)
            return;

        e.preventDefault();
        e.stopPropagation();

        this.textRef.current.setEditMode(true);
    }

    onDeSelectListener = (agl) => {
        if (!this.props.editor)
            return;

        this.textRef.current.setEditMode(false);
    }

    render() {
        return (
            <AGLWrapper
                tagName="Text"
                aglComponent={this}
                {...this.props}
                data={this.getData()}
                resizeSides={!this.state.editMode ? ['e', 'w'] : []}
                style={{
                    height: "auto",
                    minHeight: "auto",
                    // pointerEvents: "none"
                }}
                getPrimaryOptions={this.getPrimaryOptions}
                getInspector={this.getInspector}
                getStaticChildren={this.getStaticChildren}
                noStretch
                onDoubleClickOverride={this.onDoubleClickOverride}
                onDeSelectListener={this.onDeSelectListener}
            />
        )
    }
}

Text.defaultProps = {
    tagName: "Text"
};
