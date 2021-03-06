import React, { Component } from 'react';
import styled, { keyframes } from 'styled-components';
import _random from 'lodash/random';
import _times from 'lodash/times';

import { SHAKE_DURATION, LEAF_FALL_DURATION } from 'components/constants';
import Leaf from './Leaf';

const getLeftPos = (left, fallToX, fallLeft, offset = 1) => {
  const leftOffset = (fallLeft ? (left - fallToX) : (fallToX - left)) / 4;
  return fallLeft ? left - (leftOffset * offset) : left + (leftOffset * offset);
}

const leafFall = (props) => {
  const { left, top, fallToX, fallLeft, fallToY } = props;
  return keyframes`
    0% {
      top: ${top}px;
      left: ${left}px;
      opacity: 1;
    }
    20% {
      top: ${top - 5}px;
      left: ${getLeftPos(left, fallToX, fallLeft)}px;
    }
    30% {
      top: ${top - 10}px;
      left: ${getLeftPos(left, fallToX, fallLeft, 2)}px;
    }
    40% {
      top: ${top}px;
      left: ${getLeftPos(left, fallToX, fallLeft, 3)}px;
    }
    100% {
      top: ${fallToY}px;
      left: ${fallToX}px;
      opacity: 0;
    }
  `;
};

const shake = (top, height) => {
  return keyframes`
    0% {
      height: ${height}px;
      top: ${top}px;
    }
    50% {
      height: ${height - 5}px;
      top: ${top + 5}px;
    }
    100% {
      height: ${height}px;
      top: ${top}px;
    }
  `;
};

const StyledScenery = styled.div`
  top: ${props => props.top}px;
  left: ${props => props.left}px;
  height: ${props => props.height}px;
  width: ${props => props.width}px;
  position: absolute;
  z-index: 3;

  &.burrow {
    &.right {
      img {
        transform: scaleX(-1);
      }
    }
  }

  img {
    height: 100%;
    width: 100%;
  }

  &.shake {
    animation: ${props => shake(props.top, props.height)} ${SHAKE_DURATION}ms linear;
  }
`;

const FallingLeaf = styled.div`
  top: ${props => props.top}px;
  left: ${props => props.left}px;
  height: ${props => props.height}px;
  width: ${props => props.width}px;
  position: absolute;
  animation: ${props => leafFall(props)} ${LEAF_FALL_DURATION}ms linear;
  z-index: 3;
  transform: ${props => props.fallLeft ? 'none' : 'scaleX(-1)'};

  img {
    height: 100%;
    width: 100%;
  }
`;

class SceneryItem extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    const {
      position: { x, y },
      sceneryClass,
      height,
      width,
      image,
      index,
      shake
    } = this.props;
    const styleProps = {
      top: y,
      left: x,
      height,
      width
    };

    const LeafObj = new Leaf();

    const looseLeaves = shake ? _times(3, idx => {
      const section = width / 3;
      const randStart = idx * section;
      const leafX = x + _random(randStart + 10, Math.min(((randStart * (idx + 1)) - 30), width - 10));
      const leafY = y + _random(5, height * .4);
      const itemCenter = x + ((width - 10) / 2);
      const fallLeft = leafX < itemCenter;
      return (
        <FallingLeaf
          top={leafY}
          left={leafX}
          height={LeafObj.height}
          width={LeafObj.width}
          fallToX={fallLeft ? leafX - 60 : leafX + 60}
          fallToY={y + (height * .65)}
          fallLeft={fallLeft}
          key={idx}
        >
          <img src={LeafObj.image} />
        </FallingLeaf>
      );
    }) : [];

    return [
      <StyledScenery
        className={`scenery ${sceneryClass || ''} scenery_index_${index} ${shake ? 'shake' : ''}`}
        key={`scenery_index_${index}`}
        {...styleProps}
      >
        {image && <img src={image} />}
      </StyledScenery>,
      ...looseLeaves
    ]
  }
}

export default SceneryItem;
