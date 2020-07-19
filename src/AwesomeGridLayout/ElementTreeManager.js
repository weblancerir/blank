export default class ElementTreeManager {
    static create = (pageName) => {
        let elementTree = {
            pageName,
            tree: {

            }
        };
    };

    // _reactInternalFiber
    static addLeave = (elementTree, parentId, elementTag, props) => {
        let parentNode = ElementTreeManager.findParentNode(elementTree, parentId);

        parentNode.tree[props.id] = {
            id: props.id,
            elementTag,
            props
        }
    };

    static findParentNode = (elementTree, parentId) => {
        let node = Object.values(elementTree.tree).find(leave => {
            return leave.id === parentId;
        });

        if (!node)
            node = elementTree.tree["page"];

        return node;
    };
}
