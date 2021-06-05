export function getTextStyle (textTheme, textStaticData, textDesignData) {
    return {
        fontFamily: textDesignData.fontFamily || "Arial",
        textAlign: `${textDesignData.textAlign || 'left'}`,
        fontSize: `${textDesignData.fontSize || textTheme.fontSize || 22}px`,
        fontWeight: `${textDesignData.fontWeight || textTheme.fontWeight || 'normal'}`,
        fontStyle: `${textDesignData.fontStyle || textTheme.fontStyle || 'normal'}`,
        fontDecoration: textDesignData.fontDecoration || textTheme.fontDecoration,
        color: textDesignData.color || textTheme.color || '#181818',
        backgroundColor: textDesignData.backgroundColor || textTheme.backgroundColor,
        lineHeight: textDesignData.lineHeight || textTheme.lineHeight || 'normal',
        letterSpacing: textDesignData.letterSpacing || textTheme.letterSpacing || 'normal'
    }
}

export function getFontDataByFamily (allFonts, fontFamily) {
    console.log("getFontDataByFamily", fontFamily)
    let fontData = Object.values(allFonts).find(fontData => {
        return fontFamily === fontData.fontFamily;
    })

    if (fontData)
        return fontData;

    return Object.values(allFonts).find(fontData => {
        return "Arial" === fontData.name;
    })
}

export function getFontDataByName (allFonts, name) {
    let fontData = Object.values(allFonts).find(fontData => {
        return name === fontData.name;
    })

    if (fontData)
        return fontData;

    return Object.values(allFonts).find(fontData => {
        return "Arial" === fontData.name;
    })
}

export function getInheritTextStyle () {
    return {
        fontFamily: "inherit",
        textAlign: "inherit",
        fontSize: "inherit",
        fontWeight: "inherit",
        fontStyle: "inherit",
        fontDecoration: "inherit",
        color: "inherit",
        backgroundColor: "inherit",
        lineHeight: "inherit",
        letterSpacing: "inherit",
    }
}

export function applyProperty (doc, win, propertyName, value, tagName = 'span') {
    let html = getSelectionHtmlRemoveProperty(doc, win, propertyName);
    if (html && !html.includes('<')) {
        let sel = doc.getSelection();
        let range = sel.getRangeAt(0);
        range.deleteContents();
        var span = doc.createElement(tagName);
        span.setAttribute("style", `${propertyName}: ${value}; display: inline`);
        span.innerText = html;
        range.insertNode(span);
        sel.addRange(range);
    }
    else if (html) {
        doc.execCommand(
            'insertHTML', false, `<${tagName} style="${propertyName}: ${value}">${html}</${tagName}>`);
    }
}

export function getSelectionHtmlRemoveProperty (doc, win, propertyName, tagName = 'span') {
    let range;
    if (doc.selection && doc.selection.createRange) {
        range = doc.selection.createRange();
        return range.htmlText;
    }
    else if (win.getSelection) {
        let selection = win.getSelection();
        if (selection.rangeCount > 0) {
            range = selection.getRangeAt(0);
            let clonedSelection = range.cloneContents();
            let div = doc.createElement(tagName);
            div.appendChild(clonedSelection);
            let nodes = div.getElementsByTagName("*");
            for (let node of nodes) {
                if (node.style && node.style.removeProperty)
                    node.style.removeProperty(propertyName);
            }
            return div.innerHTML;
        }
        else {
            return '';
        }
    }
    else {
        return '';
    }
}

export function getSelectionText (doc, win, tagName = 'span') {
    let range;
    if (doc.selection && doc.selection.createRange) {
        range = doc.selection.createRange();
        return range.htmlText;
    }
    else if (win.getSelection) {
        let selection = win.getSelection();
        if (selection.rangeCount > 0) {
            range = selection.getRangeAt(0);
            let clonedSelection = range.cloneContents();
            let div = doc.createElement(tagName);
            div.appendChild(clonedSelection);
            return div.innerText;
        }
        else {
            return '';
        }
    }
    else {
        return '';
    }
}

function nextNode(node) {
    if (node.hasChildNodes()) {
        return node.firstChild;
    } else {
        while (node && !node.nextSibling) {
            node = node.parentNode;
        }
        if (!node) {
            return null;
        }
        return node.nextSibling;
    }
}

export function getRangeSelectedNodes(range) {
    var node = range.startContainer;
    var endNode = range.endContainer;

    // Special case for a range that is contained within a single node
    if (node == endNode) {
        return [node];
    }

    // Iterate nodes until we hit the end container
    var rangeNodes = [];
    while (node && node != endNode) {
        rangeNodes.push( node = nextNode(node) );
    }

    // Add partially selected nodes at the start of the range
    node = range.startContainer;
    while (node && node != range.commonAncestorContainer) {
        rangeNodes.unshift(node);
        node = node.parentNode;
    }

    return rangeNodes;
}

export function getParentLine(range) {
    var node = range.startContainer;
    let found = false;
    let parentLine;
    while (!found) {
        let newParantLine = (parentLine || node).parentNode;
        if (!newParantLine) {
            parentLine = undefined;
            break;
        }

        if (newParantLine.id === "editableDiv") {
            found = true;
            break;
        } else {
            parentLine = newParantLine;
        }
    }

    return parentLine;
}

export function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export function getRandomLinkId(lenght) {
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var id = '';
    for (var i = 0; i < lenght; i++) {
        id += letters[Math.floor(Math.random() * letters.length)];
    }
    return id;
}

export function getLineSelected(selection) {
    let range = selection.getRangeAt(0);
    let nodes = getRangeSelectedNodes(range);

    let lineNodes = [];

    nodes.forEach(node => {
        let found = false;
        let parentLine = node;
        while (!found) {
            let newParantLine = parentLine.parentNode;
            if (!newParantLine) {
                parentLine = undefined;
                break;
            }

            if (newParantLine.id === "editableDiv") {
                found = true;
                break;
            } else {
                parentLine = newParantLine;
            }
        }

        if (parentLine && !lineNodes.includes(parentLine))
            lineNodes.push(parentLine);
    })

    return lineNodes;
}
