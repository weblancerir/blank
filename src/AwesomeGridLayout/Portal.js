import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

class Portal extends React.Component {
    componentWillUnmount() {
        if (this.defaultNode) {
            document.body.removeChild(this.defaultNode);
        }
        this.defaultNode = null;
    }

    canUseDOM = !!(
        typeof window !== 'undefined' &&
        window.document &&
        window.document.createElement
    );

    render() {
        if (!this.canUseDOM) {
            return null;
        }
        let node = this.props.node;
        if (this.props.disabled) {
            return this.props.children;
        }
        if (this.props.nodeId) {
            node = document && document.getElementById(this.props.nodeId);
        }
        if (!node && !this.defaultNode) {
            this.defaultNode = document.createElement('div');
            document.body.appendChild(this.defaultNode);
        }
        return ReactDOM.createPortal(
            this.props.children,
            node || this.defaultNode
        );
    }
}

Portal.propTypes = {
    children: PropTypes.node.isRequired,
    node: PropTypes.any
};

export default Portal;
