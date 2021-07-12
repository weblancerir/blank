import {throttleDebounce} from "../AwesomeGridLayoutUtils";

let allEventTriggers = [];

export default class EventTrigger {
    constructor(owner, defaultListener) {
        this.owner = owner;
        this.listeners = [];
        if (defaultListener)
            this.listeners.push(defaultListener);
    }

    addListener = (listener) => {
        if (!this.listeners.find(l => { return l === listener; })) {
            this.listeners.push(listener);
        }
    };

    trigger = throttleDebounce((data) => {
        this.listeners.forEach(l => {
            l(this.owner, data);
        });
    }, 50);

    removeListener = (listener) => {
        let index = this.listeners.findIndex(l => { return l === listener; })
        if (index >= 0)
            this.listeners.splice(index, 1);
    };

    static clear = () => {
        allEventTriggers = [];
    }

    static getEventTrigger = (item) => {
        if (!allEventTriggers[item.props.id])
            allEventTriggers[item.props.id] = new EventTrigger(item);
        return allEventTriggers[item.props.id];
    }
}
