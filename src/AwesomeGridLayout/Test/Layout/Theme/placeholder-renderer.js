import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './placeholder-renderer.css';

const PlaceholderRenderer = ({ isOver, canDrop }) => (
    <div
        id={"111222"}
        className={classNames(
            'rst__placeholder1',
            canDrop && 'rst__placeholderLandingPad1',
            canDrop && !isOver && 'rst__placeholderCancelPad1'
        )}
    />
);

PlaceholderRenderer.defaultProps = {
    isOver: false,
    canDrop: false,
};

PlaceholderRenderer.propTypes = {
    isOver: PropTypes.bool,
    canDrop: PropTypes.bool,
};

export default PlaceholderRenderer;
