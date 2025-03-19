import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './styles.css';
import { StatusConstants } from 'src/constants/AppConstants';

const valueType = PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]);

const propTypes = {
  labels: PropTypes.shape({
    left: {
      title: PropTypes.string.isRequired,
      value: valueType,
    },
    center: {
      title: PropTypes.string.isRequired,
      value: valueType,
    },
    right: {
      title: PropTypes.string.isRequired,
      value: valueType,
    },
  }),
  onChange: PropTypes.func.isRequired,
  styles: PropTypes.object,
};

const defaultProps = {
  labels: {
    left: {
      title: 'left',
      value: 'left',
    },
    center: {
      title: 'center',
      value: 'center',
    },
    right: {
      title: 'right',
      value: 'right',
    },
  },
  onChange: (value) => console.log('value:', value),
};

const TripleToggleSwitch = ({ labels, onChange, dataStatusState }) => {
  const [switchPosition, setSwitchPosition] = useState('left');
  const [animation, setAnimation] = useState(null);

  const getSwitchAnimation = (value) => {
    let newAnimation = null;
    if (value === 'center' && switchPosition === 'left') {
      newAnimation = 'left-to-center';
    } else if (value === 'right' && switchPosition === 'center') {
      newAnimation = 'center-to-right';
    } else if (value === 'center' && switchPosition === 'right') {
      newAnimation = 'right-to-center';
    } else if (value === 'left' && switchPosition === 'center') {
      newAnimation = 'center-to-left';
    } else if (value === 'right' && switchPosition === 'left') {
      newAnimation = 'left-to-right';
    } else if (value === 'left' && switchPosition === 'right') {
      newAnimation = 'right-to-left';
    }

    onChange(value);
    setSwitchPosition(value);
    setAnimation(newAnimation);
  };
  useEffect(() => {
    setSwitchPosition(
      dataStatusState === StatusConstants.ACTIVE
        ? 'left'
        : dataStatusState === StatusConstants.INACTIVE
        ? 'center'
        : 'right'
    );
  }, [dataStatusState]);

  return (
    <div className="main-container">
      <div className={`switch ${animation} ${switchPosition}-position`}></div>
      <input
        onChange={(e) => getSwitchAnimation(e.target.value)}
        name="map-switch"
        id="left"
        type="radio"
        value="left"
      />
      <label
        className={`left-label ${switchPosition === 'left' && 'black-font'}`}
        htmlFor="left"
        name="map-switch"
      >
        <h6>{labels.left.title}</h6>
      </label>

      <input
        onChange={(e) => getSwitchAnimation(e.target.value)}
        name="map-switch"
        id="center"
        type="radio"
        value="center"
      />
      <label
        className={`center-label ${switchPosition === 'center' && 'black-font'}`}
        htmlFor="center"
        name="map-switch"
      >
        <h6>{labels.center.title}</h6>
      </label>

      <input
        onChange={(e) => getSwitchAnimation(e.target.value)}
        name="map-switch"
        id="right"
        type="radio"
        value="right"
      />
      <label
        className={`right-label ${switchPosition === 'right' && 'black-font'}`}
        htmlFor="right"
        name="map-switch"
      >
        <h6>{labels.right.title}</h6>
      </label>
    </div>
  );
};

TripleToggleSwitch.propTypes = propTypes;
TripleToggleSwitch.defaultProps = defaultProps;

export default TripleToggleSwitch;
