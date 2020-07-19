export default class EventTrigger {
    constructor(defaultListener) {
        this.listeners = [];
        if (defaultListener)
            this.listeners.push(defaultListener);
    }

    addListener = (listener) => {
        console.log("addListener0");
        if (!this.listeners.find(l => { return l === listener; })) {
            console.log("addListener1");
            this.listeners.push(listener);
        }
    };

    trigger = (data) => {
        console.log("trigger0");
        if (!this.prevent) {
            this.prevent = true;
            console.log("trigger1");
            this.listeners.forEach(l => {
                console.log("trigger2");
                l(data);
            });
            setTimeout(() => {
                this.prevent = false;
            }, 0);
        }
    };

    removeListener = (listener) => {
        let index = this.listeners.findIndex(l => { return l === listener; })
        if (index >= 0)
            this.listeners.splice(index, 1);
    };
}
