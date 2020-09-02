export default class IFrameCommunicator {
    constructor(origin, authKey, otherWindow, onMessage) {
        this.onMessage = onMessage;
        this.origin = origin;
        this.otherWindow = otherWindow;
        this.counter = 0;
        this.authKey = authKey;
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
        let data = event.data;

        if (!data || data.authKey !== this.authKey)
            return;

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

        data.authKey = this.authKey;
        this.otherWindow.postMessage(data, this.origin || "*");
    };
}
