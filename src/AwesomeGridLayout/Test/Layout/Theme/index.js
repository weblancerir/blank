// Can override the following:
//
// style: PropTypes.shape({}),
// innerStyle: PropTypes.shape({}),
// reactVirtualizedListProps: PropTypes.shape({}),
// scaffoldBlockPxWidth: PropTypes.number,
// slideRegionSize: PropTypes.number,
// rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
// treeNodeRenderer: PropTypes.func,
// nodeContentRenderer: PropTypes.func,
// placeholderRenderer: PropTypes.func,

import nodeContentRenderer from './node-content-renderer';
import treeNodeRenderer from './tree-node-renderer';
import placeholderRenderer from './placeholder-renderer';

export default {
    nodeContentRenderer,
    treeNodeRenderer,
    placeholderRenderer,
    scaffoldBlockPxWidth: 8,
    rowHeight: 36,
    slideRegionSize: 50
};
