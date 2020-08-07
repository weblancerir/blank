import {cloneObject, JSToCSS} from "../AwesomeGridLayoutUtils";

let CSSManager = {
    pendingUpdates: {},
    animationFrameRequested: false
};

CSSManager.updateStyle = (style, styleName) => {
    CSSManager.pendingUpdates[styleName] = {
        style, styleName
    };

    if (!CSSManager.animationFrameRequested) {
        window.requestAnimationFrame(CSSManager.updateAll);
        CSSManager.animationFrameRequested = true;
    }
};

CSSManager.updateAll = () => {
    if (!CSSManager.styleNode)
        CSSManager.styleNode = document.getElementById('all-responsive-style');
    if (!CSSManager.styleNode) {
        CSSManager.styleNode = document.createElement('style');
        CSSManager.styleNode.setAttribute("id", 'all-responsive-style');
        document.head.appendChild(CSSManager.styleNode);
        CSSManager.styleNode.sheet.insertRule('.foo{color:red;}', 0);
    }

    let cssRules = CSSManager.styleNode.sheet.cssRules;
    let allRules = [];

    console.log("updateAll", cssRules.length);
    for (let i = 0; i < cssRules.length; i++) {
        let rule = cssRules[i];
        if (CSSManager.pendingUpdates[rule.selectorText]) {
            let styleData = CSSManager.pendingUpdates[rule.selectorText];

            allRules.push({cssText: `.${styleData.styleName} {${JSToCSS(styleData.style)}}`});

            delete CSSManager.pendingUpdates[rule.selectorText];
        } else {
            allRules.push({cssText: rule.cssText});
        }
    }
    console.log("updateAll allRules.length", allRules.length);

    Object.values(CSSManager.pendingUpdates).forEach(styleData => {
        allRules.push({
            cssText: `.${styleData.styleName} {${JSToCSS(styleData.style)}}`
        });
    });

    CSSManager.pendingUpdates = {};

    console.log("allRules", allRules);

    let css = allRules.map(rule => {
        return rule.cssText;
    }).join(' ');

    console.log("css", css);

    CSSManager.styleNode.innerHTML = "";
    if (CSSManager.styleNode.styleSheet) { // IE
        CSSManager.styleNode.styleSheet.cssText = css;
    } else {
        CSSManager.styleNode.appendChild(document.createTextNode(css));
    }

    CSSManager.animationFrameRequested = false;
};

export default CSSManager;
