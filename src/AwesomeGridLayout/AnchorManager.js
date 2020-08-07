import {v4 as uuidv4} from 'uuid';
import { goToAnchor } from 'react-scrollable-anchor'

export default class AnchorManager {
    constructor(siteData) {
        // TODO init all anchors
        this.allAnchors = {};
    }

    addAnchor = (name, item) => {
        let pageId = item.props.viewRef.current.props.pageId;
        let id = uuidv4();
        this.allAnchors[id] = {pageId, name, id};
        item.setAnchor(this.allAnchors[id]);
    };

    modifyAnchor = (id, newName, item) => {
        let anchor = this.allAnchors[id];
        if (!anchor) {
            this.addAnchor(newName, item);
            return;
        }

        anchor.name = newName;

        item.setAnchor(anchor);
    };

    removeAnchor = (id, item) => {
        delete this.allAnchors[id];
        item.setAnchor();
    };

    goToAnchor = (id, saveToHistory) => {
        goToAnchor(id, saveToHistory);
    };
}
