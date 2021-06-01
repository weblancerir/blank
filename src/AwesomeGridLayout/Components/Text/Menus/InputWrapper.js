import React from "react";
import InputDiv from "./InputDiv";
import {
    getInheritTextStyle,
    getParentLine,
    getSelectionHtmlRemoveProperty,
    getSelectionText,
    getTextStyle
} from "../TextHelper";
import {JSToCSS} from "../../../AwesomeGridLayoutUtils";

export default class InputWrapper extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.textareaRef = React.createRef();
        this.textEditorRef = React.createRef();
    }

    componentDidMount() {
        this.props.onLoad && this.props.onLoad();
        this.updateHeight();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.props.onUpdate && this.props.onUpdate();
    }

    updateHeight = () => {
        this.setState({
            // width: this.textareaRef.current.scrollWidth,
            height: this.textareaRef.current.scrollHeight,
        })
    }

    onChange = (e, callback) => {
        this.updateHeight();
        this.props.onChange && this.props.onChange(e, callback);
    }

    onInput = (e) => {
        if (e)
            e.target.value = this.textareaRef.current.innerHTML;
        else
            e = {target: {value: this.textareaRef.current.innerHTML}}

        this.onChange(e);
    }

    keydown = (e) => {
        e = e || window.event;
        let key = e.which || e.keyCode; // keyCode detection
        if (key === 13) {
            e.preventDefault();
            e.stopPropagation();

            let sel = this.props.doc.getSelection();
            let range = sel.getRangeAt(0);
            let line = getParentLine(range);
            if (!line)
                return;

            range.deleteContents();

            range.setEndAfter(line);

            let text = getSelectionText(this.props.doc, this.props.iframeNode.contentWindow);

            if (!text) {
                let br = this.props.doc.createElement("br");
                range.startContainer.after(br);
                range.setStartBefore(br);
            }

            let html = getSelectionHtmlRemoveProperty(this.props.doc, this.props.iframeNode.contentWindow);

            console.log("html", html, text)

            range.deleteContents();

            range.setStartAfter(line);

            line.insertAdjacentHTML('afterend', html)
            this.onInput();
        } else {
            // this.props.doc.execCommand('selectAll');
                // let text = getSelectionText(this.props.doc, this.props.iframeNode.contentWindow);

            console.log("text", this.textareaRef.current.innerText)
            if (!this.textareaRef.current.innerText.trim()) {
                this.textareaRef.current.innerHTML = '';

                console.log("this.props.tag", this.props.tag)
                let div = this.props.doc.createElement(this.props.tag);
                div.setAttribute("title", "line");
                div.setAttribute("style", JSToCSS({...getInheritTextStyle(), ...{margin: "0px"}}))
                div.focus();
                div.innerText = String.fromCharCode(key);

                let sel = this.props.doc.getSelection();
                let range = sel.getRangeAt(0);

                range.insertNode(div);
                range.setStart(div, 1);
                range.collapse(true)

                sel.removeAllRanges()
                sel.addRange(range)
                e.preventDefault();
                e.stopPropagation();
            }
        }
    }

    init = (doc) => {
        if (!this.inited) {
            this.inited = true;
            doc.getElementById("textEditor").addEventListener("input", this.onInput);
            // doc.getElementById("textEditor").addEventListener("keydown", this.keydown);
        }
    }

    render () {
        let {textTheme, textStaticData, textDesignData} = this.props;
        let TextTag = this.props.tag;
        return (
            <div
                dir={textStaticData.dir || "ltr"}
                ref={this.textEditorRef}
                id={'textEditor'}
                style={{...{
                    width: this.props.width,
                    boxSizing: "border-box",
                    margin: 0,
                    height: this.state.height || this.props.height,
                    resize: "none",
                    overflow: "hidden"
                }, ...getTextStyle(textTheme, textStaticData, textDesignData)}}
            >
                <InputDiv
                    textareaRef={this.textareaRef}
                    value={this.props.value}
                    tag={this.props.tag}
                    textTheme={this.props.textTheme}
                    textStaticData={this.props.textStaticData}
                    textDesignData={this.props.textDesignData}
                />
            </div>
        )
    }
}
