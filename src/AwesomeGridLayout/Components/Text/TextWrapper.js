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

    render () {
        let {textTheme, textStaticData, textDesignData} = this.props;

        let TextTag = this.getTag();

        if (!this.state.editMode) {
            return (
                <TextTag
                    className="TextRoot"
                    style={getTextStyle(textTheme, textStaticData, textDesignData)}
                    dir={textStaticData.dir || "ltr"}
                    dangerouslySetInnerHTML={{ __html: textStaticData.textValue }}
                >
                    {/*<div*/}
                    {/*    style={{...{*/}
                    {/*        width: "100%",*/}
                    {/*        boxSizing: "border-box",*/}
                    {/*        margin: 0,*/}
                    {/*        height: "auto",*/}
                    {/*        overflow: "hidden",*/}
                    {/*        display: "inline-block",*/}
                    {/*        whiteSpace: 'pre-wrap'*/}
                    {/*    }}}*/}
                    {/*    dangerouslySetInnerHTML={{ __html: textStaticData.textValue }}*/}
                    {/*>*/}
                    {/*</div>*/}
                </TextTag>
            )
        } else {
            return (
                <ClickAwayListener onClickAway={(e) => this.setEditMode(false)}>
                    <>
                    {
                        this.state.iframeNode &&
                        <TextEditor
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
                            border: 0
                        }}
                        head={<>
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
//                                 html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, font, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td {
//   margin: 0;
//   padding: 0;
//   border: 0;
//   outline: 0;
//   vertical-align: baseline;
//   background: transparent;
// }
                            `}
                            </style>
                        </>}
                        documentRef={(doc) => {
                            this.doc = doc;
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
            )
        }
    }
}
