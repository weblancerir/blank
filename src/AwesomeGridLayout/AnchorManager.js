import {v4 as uuidv4} from 'uuid';
import { goToAnchor } from 'react-scrollable-anchor'
import {EditorContext} from "./Editor/EditorContext";

export default class AnchorManager {
    constructor() {
    }

    addAnchor = (name, item) => {
        let pageId = item.props.viewRef.current.props.pageId;
        let page = item.props.viewRef.current;
        if (!page.props.anchors) page.props.anchors = {};
        let id = uuidv4();
        page.props.anchors[id] = {pageId, name, id};
        item.setAnchor(page.props.anchors[id]);
    };

    modifyAnchor = (id, newName, item) => {
        let page = item.props.viewRef.current;
        let anchor = page.props.anchors[id];
        if (!anchor) {
            this.addAnchor(newName, item);
            return;
        }

        anchor.name = newName;

        item.setAnchor(anchor);
    };

    removeAnchor = (id, item) => {
        let page = item.props.viewRef.current;
        delete page.props.anchors[id];
        item.setAnchor();
    };

    getAnchors = (pageData) => {
        return pageData.props.anchors || {};
    };
}
