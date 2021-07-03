import React from "react";
import {getRandomLinkId, getRangeSelectedNodes} from "../../TextHelper";

export function addLinkData (doc, linkData) {
    if (linkData.type === "None") {
        removeSelectedLink(doc);
        return;
    }

    let linkId = getRandomLinkId(12);
    if (getSelectedLinkId(doc))
    {
        linkId = getSelectedLinkId(doc);
        let node = doc.getElementById(linkId);
        node.setAttribute("linkdata", JSON.stringify(linkData));
    }
    else
    {
        doc.execCommand('underline');
        doc.execCommand('createlink', false, "link1");

        let nodes = doc.querySelectorAll(`[href="link1"]`);

        nodes.forEach(node => {
            node.removeAttribute("href");
            node.setAttribute("id", linkId);
            node.setAttribute("islink", true);
            node.setAttribute("linkdata", JSON.stringify(linkData));
        })
    }
}

export function removeSelectedLink (doc) {
    let linkId = getSelectedLinkId(doc);

    if (!linkId)
        return;

    let node = doc.getElementById(linkId);

    var parent = node.parentNode;

    while (node.firstChild) parent.insertBefore(node.firstChild, node);

    parent.removeChild(node);
}

export function getSelectedLinkData (doc) {
    let linkId = getSelectedLinkId(doc);

    if (!linkId)
        return;

    let node = doc.getElementById(linkId);

    return JSON.parse(node.getAttribute("linkdata"));
}

export function getSelectedLinkId (doc) {
    let selection = doc.getSelection();

    if (selection.rangeCount < 1)
        return false;

    let range = selection.getRangeAt(0);
    let nodes = getRangeSelectedNodes(range);
    let linkId = false;
    nodes.forEach(node => {
        while (node) {
            if (node.tagName === "A" && node.hasAttribute("islink")) {
                linkId = node.getAttribute("id");
                break;
            }
            node = node.parentNode;
        }
    });
    return linkId;
}

export function resolveLinks (element, preview, production, editorContext) {
    let nodes = element.querySelectorAll(`[islink=true]`);

    nodes.forEach(node => {
        prepareLink(node, preview, production, editorContext);
    })
}

export function prepareLink (node, preview, production, editorContext, linkData) {
    if (!linkData)
        linkData = JSON.parse(node.getAttribute("linkdata"));

    if (!preview && !production)
        return;

    if (!linkData)
        return;

    switch (linkData.type) {
        case "WebAddress":
            if (linkData.data.window === "current" && !production)
                return;

            node.setAttribute("href", linkData.data.url);
            if (linkData.data.window === "new") {
                node.setAttribute("target", "_blank");
            }
            break;
        case "Page":
            if (linkData.data.window === "new" && !production)
                return;

            // node.addEventListener('click', () => {pageLinkHandle(editorContext, linkData)})
            node.onclick = () => {pageLinkHandle(editorContext, linkData)};
            // node.setAttribute("href", "");
            break;
        case "Anchor":
            node.setAttribute("href", `#${linkData.data.anchorId}`);
            break;
        case "TopBottomThisPage":
            node.setAttribute("href", `#${linkData.data.position}`);
            break;

        case "Document":
        // TODO
            break;
        case "Email":
            node.setAttribute("href", `mailto:${linkData.data.email}?subject=${
                linkData.data.subject || "subject"
            }`);
            break;
        case "Phone":
            node.setAttribute("href", `tel:${linkData.data.number}`);
            break;
        case "LightBox":
        // TODO
            break;
    }

    node.removeAttribute("linkdata");
}

function pageLinkHandle (editorContext, linkData) {
    if (linkData.data.window === 'current') {
        console.log("pageLinkHandle");
        // editorContext.setPageData(linkData.data.pageId);
        editorContext.redirect(linkData.data.pageId);
    } else {
        // TODO open page in other window !Important
    }
}
