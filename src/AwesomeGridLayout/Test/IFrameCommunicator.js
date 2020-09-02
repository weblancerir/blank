export default class IFrameCommunicator {
    constructor(origin, otherWindow, onMessage) {
        this.onMessage = onMessage;
        this.origin = origin;
        this.otherWindow = otherWindow;
        this.counter = 0;
        this.callbacks = {};
        this.responses = {};

        window.addEventListener("message", (event) => {
            if (this.origin && event.origin !== this.origin) {
                return;
            }

            this.processIncomingMessage(event);
        });
    }

    processIncomingMessage = (event) => {
        let data;
        try {
            data = JSON.parse(event.data);
        } catch (e) {
            console.error("IFrameCommunicator: must receive json data");
            return;
        }

        if (data && data.r) {
            let r = data.r;
            this.callbacks[r](data);
            delete this.callbacks[r];
        }
        else
        {
            let responseFunc = () => {};
            if (data && data.c) {
                let c = data.c;
                responseFunc = this.responses[c] = (data) => {
                    data.r = c;
                    this.post(data);
                }
            }

            this.onMessage(event, responseFunc);
        }
    };

    post = (data, callback) => {
        if (callback) {
            this.counter++;
            data.c = this.counter;
            this.callbacks[data.c] = callback;
        }

        this.otherWindow.postMessage(JSON.stringify(data), this.origin || "*");
    };
}
