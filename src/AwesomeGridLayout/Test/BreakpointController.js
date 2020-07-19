export default class BreakpointController {
    constructor(breakpointmanager, editorData, pageRef) {
        this.breakpointmanager = breakpointmanager;
        this.editorData = editorData;
        this.pageRef = pageRef;
    }

    changeBreakpoint = (bpName) => {
        if (this.breakpointmanager.current() === bpName)
            return;

        let bpData = this.breakpointmanager.getBpData(bpName);

        if (!bpData)
            return;

        let width = Math.min(parseInt((bpData.start * (1.1)).toFixed(0)), bpData.end);
        let left = (this.editorData.innerWidth - width) / 2;
        if (left < 50)
            left = 50;
        let top = this.pageRef.current.getSize(false).top;
        let height = this.pageRef.current.getSize(false).height;

        this.pageRef.current.setSize(top, left, width, height);
    };

    changeWidth = (width) => {
        let left = (this.editorData.innerWidth - width) / 2;
        if (left < 50)
            left = 50;
        let top = this.pageRef.current.getSize(false).top;
        let height = this.pageRef.current.getSize(false).height;

        this.pageRef.current.setSize(top, left, width, height);
    };

    updateBreakpoint = (name, start, end) => {
        this.breakpointmanager.updateBreakpoint(name, start, end);
    };

    deleteBreakpoint = (name) => {
        this.breakpointmanager.deleteBreakpoint(name);
    };
}
