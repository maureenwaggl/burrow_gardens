import React, { Component } from 'react';
import { branch } from 'baobab-react/higher-order';
import _capitalize from 'lodash/capitalize';
import _min from 'lodash/min';
import _max from 'lodash/max';
import _random from 'lodash/random';
import _sample from 'lodash/sample';

import {
  moveEntityBack,
  moveEntityForward,
  updateCharacterPosition
} from 'actions';

import 'less/Characters.less';

@branch({
  tile: ['tile'],
  boardDimensions: ['boardDimensions'],
  gameVisible: ['gameVisible']
})
class Bunny extends Component {
  constructor(props, context) {
    super(props, context);

    this.toggleTransition = this.toggleTransition.bind(this);
    this.getBunnyImage = this.getBunnyImage.bind(this);
    this.moveAI = this.moveAI.bind(this);
    this.moveCharacter = this.moveCharacter.bind(this);
    this.stopMovingCharacter = this.stopMovingCharacter.bind(this);

    this.directions = ['up', 'down', 'left', 'right'];

    this.maxBounds = {
      top: props.position.y - 100,
      bottom: props.position.y + 100,
      left: props.position.x - 200,
      right: props.position.x + 200
    };

    this.state = {
      moveTransition: true,
      startingPosition: props.position,
      moving: [],
      lastDirection: 'right'
    };
  }

  componentDidMount() {
    if (!this.checkIfIsHero()) {
      this.moveAI();
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.moving != this.state.moving) {
      const lastDirection = nextState.moving.length ? nextState.moving[nextState.moving.length - 1] : this.state.lastDirection;

      if (lastDirection != this.state.lastDirection) {
        this.setState({ lastDirection });
      }

      if (nextState || !nextState.moving.length) {
        clearTimeout(this.movingTimeout);
        this.movingTimeout = null;
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    // Tile is changing - temporarily disable movement transition
    // This will prevent the hero from appearing to slide across the tile to the new starting position
    if (nextProps.tile != this.props.tile) {
      clearTimeout(this.transitionTimeout);
      this.transitionTimeout = null;
      this.toggleTransition(false);
    }

    if (nextProps.gameVisible != this.props.gameVisible && nextProps.gameVisible) {
      // TODO: Handle when tab is no longer active/visible
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Add back the transition once the tile has been rendered
    if (!this.state.moveTransition && !this.transitionTimeout) {
      this.transitionTimeout = setTimeout(this.toggleTransition.bind(this, true), 100);
    }
  }

  toggleTransition(moveTransition) {
    this.setState({ moveTransition });
  }

  getPosNumber(pos) {
    return Number(pos.replace('px', ''));
  }

  getBunnyImage() {
    const { isMoving, direction, isFlopped, isLoaf, bunnyImages } = this.props;
    const useDirection = this.checkIfIsHero() ? direction : this.state.lastDirection;
    let imageKey = 'left';

    if (isFlopped || isLoaf) {
      imageKey = isFlopped ? 'flop' : 'loaf';

      if (['up', 'down'].indexOf(useDirection) > -1) {
        imageKey = imageKey + _capitalize(useDirection);
      }
    } else {
      if (['up', 'down'].indexOf(useDirection) > -1) {
        imageKey = useDirection;
      }

      if (this.props.isMoving || this.state.moving.length) {
        imageKey = imageKey + 'Gif';
      }
    }

    return bunnyImages[imageKey];
  }

  moveAI() {
    const direction = _sample(this.directions);
    const duration = _random(1.5, 3, true) * 1000;
    const waitTimeout = _random(3, 7, true) * 1000;

    setTimeout(() => {
      this.setState({
        moving: [direction]
      }, () => {
        this.moveCharacter();

        setTimeout(this.stopMovingCharacter, duration);
      });
    }, waitTimeout);
  }

  stopMovingCharacter() {
    this.setState({ moving: [] });
  }

  shouldContinueMoving(newPos, maxBound, oldPos) {
    // If newPos is equal to the old position, we're colliding with an entity,
    // so stop moving the character
    if (newPos == oldPos) {
      return false;
    }

    if (['top', 'left'].indexOf(maxBound) > -1) {
      return newPos > this.maxBounds[maxBound];
    }

    return newPos < this.maxBounds[maxBound];
  }

  moveCharacter() {
    const { moving } = this.state;
    const {
      position: { x, y }
    } = this.props;

    let newX = x;
    let newY = y;
    let continueMoving = false;

    for (let m = 0; m < moving.length; m++) {
      switch(moving[m]) {
        case 'up':
          const movePlayerUp = moveEntityBack(this, moving, 'y', newX, newY, moving[m]);
          newY = _max([movePlayerUp.value, this.maxBounds.top]);
          continueMoving = this.shouldContinueMoving(newY, 'top', y);
          break;
        case 'down':
          const movePlayerDown = moveEntityForward(this, moving, 'y', newX, newY, moving[m]);
          newY = _min([movePlayerDown.value, this.maxBounds.bottom]);
          continueMoving = this.shouldContinueMoving(newY, 'bottom', y);
          break;
        case 'left':
          const movePlayerLeft = moveEntityBack(this, moving, 'x', newX, newY, moving[m]);
          newX = _max([movePlayerLeft.value, this.maxBounds.left]);
          continueMoving = this.shouldContinueMoving(newX, 'left', x);
          break;
        case 'right':
          const movePlayerRight = moveEntityForward(this, moving, 'x', newX, newY, moving[m]);
          newX = _min([movePlayerRight.value, this.maxBounds.right]);
          continueMoving = this.shouldContinueMoving(newX, 'right', x);
          break;
      }
    }

    updateCharacterPosition(this.props.id, { x: newX, y: newY });

    if (continueMoving && this.state.moving.length) {
      this.movingTimeout = setTimeout(this.moveCharacter, 120);
    } else {
      this.stopMovingCharacter();
      this.moveAI();
    }
  }

  checkIfIsHero() {
    return this.props.id == 'Hero';
  }

  render() {
    const { name, style, children, direction, isFlopped, id } = this.props;
    const { moveTransition, moving, lastDirection } = this.state;
    const bunnyImage = this.getBunnyImage();
    const useDirection = this.checkIfIsHero() ? direction : lastDirection;

    return (
      <div
        className={`bunny ${name} ${moveTransition ? '' : 'no-transition'} ${useDirection} ${isFlopped ? 'isFlopped' : ''} bunny_index_${id}`}
        style={style || {}}
      >
        <img src={bunnyImage} />
        {children}
      </div>
    );
  }
}

export default Bunny;