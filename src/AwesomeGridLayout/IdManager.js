export default class IdManager {
    constructor(prefix) {
        this.prefix = prefix + '_';
        this.allId = {};
    }

    getId = (preferName, fixName) => {
        let result;
        let baseId = !fixName? this.prefix + preferName: fixName;
        let id = baseId;
        let postNo = 1;
        while (!result) {
            if (this.allId[id]) {
                id = baseId + "_" + postNo;
                postNo++;
            } else {
                result = id;
            }
        }

        this.allId[id] = true;

        return result;
    };

    setItem = (id, item) => {
        this.allId[id] = item;
    };

    // return agl reference
    getItem = (id) => {
        return this.allId[id];
    };

    removeId = (id) => {
        delete this.allId[id];
    };
}
