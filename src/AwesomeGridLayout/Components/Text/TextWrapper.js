import React from "react";
import Frame from 'iframe-react';
import InputWrapper from "./Menus/InputWrapper";
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import TextEditor from "./Menus/TextEditor";
import {EditorContext} from "../../Editor/EditorContext";
import {getTextStyle} from "./TextHelper";

export default class TextWrapper extends React.PureComponent {
    static contextType = EditorContext;

    constructor(props) {
        super(props);

        this.state = {
            editMode: false,
            editableStyle: {

            },
            iframeNode: undefined
        };

        this.iframe = React.createRef();
        this.inputWrapperRef = React.createRef();
        this.textEditorRef = React.createRef();
    }

    setEditableStyle = (editableStyle) => {
        this.setState({editableStyle});
    }

    onEditorStateChange = (editorState) => {
        this.setState({
            editorState,
        });
    };

    resizeIFrameToFitContent( document ) {
        let textarea = document.getElementById("textEditor");
        let rect = textarea.getBoundingClientRect();
        this.setState({
            iframeWidth: rect.width,
            iframeHeight: rect.height,
        })

        this.inputWrapperRef.current && this.inputWrapperRef.current.init(document);

        this.setState({iframeNode: this.iframe.current.frame})

        this.updateStyleSheets();
    }

    updateStyleSheets = () => {
        if (this.doc)
            this.context.calculateColorCSS(this.doc);
    }

    setEditMode = (editMode) => {
        if (!editMode)
            this.setState({iframeNode: undefined});
        this.setState({editMode});
        this.props.onEditModeChange && this.props.onEditModeChange(editMode);
    }

    getTag = () => {
        let {textDesignData} = this.props;
        let textTheme = this.context.getTheme("Text", textDesignData.textTheme) || {};
        return textDesignData.tagName || textTheme.tagName || "h6";
    }

    updateInputWrapper = () => {
        this.inputWrapperRef.current.updateHeight();
    }

    onIframeTextClicked = (e) => {
        if (this.textEditorRef && this.textEditorRef.current)
            this.textEditorRef.current.onIframeTextClicked(e);
    }

    render () {
        let {textTheme, textStaticData, textDesignData} = this.props;

        let TextTag = this.getTag();

        let editDisplayNoneStyle = this.state.editMode? {}: {display: "none"};
        let nonEditDisplayNoneStyle = !this.state.editMode? {}: {display: "none"};
        return (
            <>
                <TextTag
                    className="TextRoot"
                    style={{
                        ...getTextStyle(textTheme, textStaticData, textDesignData),
                        ...nonEditDisplayNoneStyle
                    }}
                    dir={textStaticData.dir || "ltr"}
                    dangerouslySetInnerHTML={{ __html: textStaticData.textValue }}
                >
                </TextTag>
                <ClickAwayListener onClickAway={(e) => this.setEditMode(false)}>
                    <>
                        {
                            this.state.iframeNode && this.state.editMode &&
                            <TextEditor
                                ref={this.textEditorRef}
                                onChangeData={this.props.onChangeData}
                                inputWrapperRef={this.inputWrapperRef}
                                onChange={this.props.onChange}
                                textStaticData={textStaticData}
                                textTheme={textTheme}
                                textDesignData={textDesignData}
                                anchorEI={this.state.iframeNode}
                                iframeNode={this.state.iframeNode}
                                updateInputWrapper={this.updateInputWrapper}
                                doc={this.doc}
                            />
                        }
                        <Frame
                            id={"Hello"}
                            key={'textEditorFrame'}
                            ref={this.iframe}
                            title="iFrame example"
                            style={{
                                width: this.state.iframeWidth || "unset",
                                height: this.state.iframeHeight || "unset",
                                border: 0,
                                display: "block",
                                ...editDisplayNoneStyle
                            }}
                            head={<>
                                <link id="wix_richtext_font_url_googleFonts" type="text/css" rel="stylesheet"
                                      href="https://weblancerstaticdata.s3.ir-thr-at1.arvanstorage.com/StaticFonts.css"/>
                                <style type="text/css">
                                    {`
                            body{
                                width: fit-content;
                                height: fit-content;
                                box-sizing: border-box;
                                margin: 0px;
                                display: flex;
                                overflow: hidden;
                            }
                            body>div{
                                width: fit-content;
                                height: fit-content;
                                box-sizing: border-box;
                                margin: 0px;
                                display: flex;
                                overflow: hidden;
                            }
                            

                        `}
                                </style>
                            </>}
                            documentRef={(doc) => {
                                this.doc = doc;
                                console.log("Listen !!!!!!!")
                                this.doc.addEventListener("click", (e) => {
                                    this.onIframeTextClicked(e);
                                })
                            }}
                        >
                            <InputWrapper
                                onLoad={() => {
                                    this.resizeIFrameToFitContent(this.doc);
                                }}
                                onUpdate={() => {
                                    this.resizeIFrameToFitContent(this.doc);
                                }}
                                onChange={this.props.onChange}
                                value={textStaticData.textValue}
                                width={this.props.width}
                                ref={this.inputWrapperRef}
                                tag={this.getTag()}
                                textTheme={textTheme}
                                textStaticData={textStaticData}
                                textDesignData={textDesignData}
                                iframeNode={this.state.iframeNode}
                                doc={this.doc}
                            >
                            </InputWrapper>
                        </Frame>
                    </>
                </ClickAwayListener>
            </>
        )
    }
}
