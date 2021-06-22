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
import MenuButton from "../../Menus/MenuBase/MenuButton";
import AnimationDesign from "../Containers/Menus/AnimationDesign";

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
            <MenuButton
                key={4}
                icon={<span className="MenuButtonLabelSpan">Edit Text</span>}
                select={this.props.select}
                onClick={(e) => {
                    this.onDoubleClickOverride(this.getAgl(), e);
                }}
            />,
            <MenuButton
                key={2}
                icon={ <img draggable={false} width={16} height={16}
                            src={process.env.PUBLIC_URL + '/static/icon/animation.svg'} /> }
                select={this.props.select}
                title="Animation Design"
                menu={(e) =>
                    <AnimationDesign
                        defaultPosition={{
                            x: e.clientX + 48 || 48,
                            y: e.clientY + 48 || 48
                        }}
                        onDesignChange={this.onDesignChange}
                        select={this.props.select}
                        item={this.getAgl()}
                    />
                }
            />,
            <MenuButton
                key={33}
                icon={ <img draggable={false} width={16} height={16}
                            src={process.env.PUBLIC_URL + '/static/icon/savewhite.svg'} /> }
                select={this.props.select}
                hide={this.context.user.role === "user"}
                title="Copy data"
                onClick={(e) => {
                    this.showComponentCode();
                }}
            />
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
