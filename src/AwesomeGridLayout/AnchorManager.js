import {v4 as uuidv4} from 'uuid';
import { goToAnchor } from 'react-scrollable-anchor'

export default class AnchorManager {
    constructor() {
        this.allAnchors = {};
    }

    addAnchor = (name, item) => {
        this.allAnchors[name] = {name: name, id: uuidv4()};
        item.setAnchor(this.allAnchors[name]);
    };

    goToAnchor = (name, saveToHistory) => {
        goToAnchor(this.allAnchors[name].id, saveToHistory);
    };
}
