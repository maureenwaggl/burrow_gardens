import React, { Component } from 'react';
import { branch } from 'baobab-react/higher-order';

import * as constants from 'components/Characters/constants';

import Bunny from 'components/Characters/Bunny';

import {
  updateHeroPosition,
  toggleShowMenu,
  moveEntityBack,
  moveEntityForward,
  setHeroLastDirection,
  getOppositeDirection,
  updateHeroSize,
  getEntityCollisions,
  changeMenuTab
} from 'actions';

import bunnyLeftImg from 'images/bunnies/bunny_left.png';
import bunnyRightImg from 'images/bunnies/bunny_right.png';
import bunnyUpImg from 'images/bunnies/bunny_up.png';
import bunnyDownImg from 'images/bunnies/bunny_down.png';
import bunnyLeftGif from 'images/bunnies/bunny_left_gif.gif';
import bunnyRightGif from 'images/bunnies/bunny_right_gif.gif';
import bunnyUpGif from 'images/bunnies/bunny_up_gif.gif';
import bunnyDownGif from 'images/bunnies/bunny_down_gif.gif';
import bunnyLoafLeftImg from 'images/bunnies/bunny_left_loaf.png';
import bunnyLoafRightImg from 'images/bunnies/bunny_right_loaf.png';
import bunnyLoafUpImg from 'images/bunnies/bunny_up_loaf.png';
import bunnyLoafDownImg from 'images/bunnies/bunny_down_loaf.png';
import bunnyFlopLeftImg from 'images/bunnies/bunny_left_flop.png';
import bunnyFlopRightImg from 'images/bunnies/bunny_right_flop.png';
import bunnyFlopUpImg from 'images/bunnies/bunny_up_flop.png';
import bunnyFlopDownImg from 'images/bunnies/bunny_down_flop.png';

import lopBunnyLeftImg from 'images/bunnies/lop_bunny.png';
import lopBunnyUpImg from 'images/bunnies/lop_bunny_up.png';
import lopBunnyDownImg from 'images/bunnies/lop_bunny_down.png';
import lopBunnyLeftGif from 'images/bunnies/lop_bunny_gif.gif';
import lopBunnyUpGif from 'images/bunnies/lop_bunny_up_gif.gif';
import lopBunnyDownGif from 'images/bunnies/lop_bunny_down_gif.gif';

const KEYBOARD_EVENTS = {
  // Tab key
  9: 'tab',
  // Escape key
  27: 'escape',
  // Direction keys
  38: 'up',
  40: 'down',
  37: 'left',
  39: 'right',
  // WASD keys
  87: 'up',
  83: 'down',
  65: 'left',
  68: 'right',
  // Space Bar
  32: 'space',
  // i key
  73: 'inventory'
};

@branch({
  hero: ['hero'],
  boardDimensions: ['boardDimensions'],
  showMenu: ['showMenu']
})
class Hero extends Component {
  constructor(props, context) {
    super(props, context);

    this.isHero = true;

    this.movePlayer = this.movePlayer.bind(this);
    this.getKeyEvent = this.getKeyEvent.bind(this);
    this.setKeyDown = this.setKeyDown.bind(this);
    this.setKeyUp = this.setKeyUp.bind(this);
    this.setHeroIdleStatus = this.setHeroIdleStatus.bind(this);

    this.assignDimensions();
    this.bunnyImages = {
      left: bunnyLeftImg,
      right: bunnyRightImg,
      up: bunnyUpImg,
      down: bunnyDownImg,
      leftGif: bunnyLeftGif,
      rightGif: bunnyRightGif,
      upGif: bunnyUpGif,
      downGif: bunnyDownGif,
      loafLeft: bunnyLoafLeftImg,
      loafRight: bunnyLoafRightImg,
      loafUp: bunnyLoafUpImg,
      loafDown: bunnyLoafDownImg,
      flopLeft: bunnyFlopLeftImg,
      flopRight: bunnyFlopRightImg,
      flopUp: bunnyFlopUpImg,
      flopDown: bunnyFlopDownImg
    }

    this.state = {
      moving: []
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.setKeyDown);
    document.addEventListener('keyup', this.setKeyUp);

    // Set idle status when player doesn't move within 5 seconds
    this.idleTimeout = setTimeout(this.setHeroIdleStatus.bind(this, 'isLoaf'), 5000);
  }

  componentWillUpdate(nextProps, nextState) {
    const { hero } = nextProps;
    const { moving, isFlopped } = nextState;

    if (moving != this.state.moving) {
      const lastDirection = moving.length ? moving[moving.length - 1] : hero.lastDirection;

      // Set the last direction the hero was moving in
      if (lastDirection != hero.lastDirection) {
        setHeroLastDirection(lastDirection);
      }

      // If no longer moving, clear the moving timeout
      if (nextState || !moving.length) {
        clearTimeout(this.movingTimeout);
        this.movingTimeout = null;
      }
    } else if (this.state.isFlopped != isFlopped) {
      // Update dimensions when flop status is changed
      this.assignDimensions(nextProps, nextState);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.setKeyDown);
    document.removeEventListener('keyup', this.setKeyUp);
    this.clearTimeouts();
  }

  /**
   * Assigns the hero dimensions based on their idle status
   *
   * @param  {object} props - The most up to date props
   * @param  {object} state - The most up to date state
   */
  assignDimensions(props, state) {
    props = props || this.props || {};
    state = state || this.state || {};
    const isVertical = ['up', 'down'].indexOf(props.hero.lastDirection) > -1;
    const { height, width } = this.getBunnyDimensions(state.isFlopped, isVertical);

    if (this.props.hero.height != height || this.props.hero.width != width) {
      updateHeroSize(height, width);
    }
  }

  /**
   * Determines the hero dimensions based on their idle status
   *
   * @param  {Boolean} isFlopped  - If hero is in flopped status
   * @param  {Boolean} isVertical - If the hero is facing a vertical direction
   *                                Flopped dimensions are only affected when
   *                                hero is facing a horizontal direction
   *
   * @return {object} - The new dimensions to use
   */
  getBunnyDimensions(isFlopped, isVertical) {
    if (isFlopped && !isVertical) {
      return {
        height: constants.BUNNY_FLOP_HEIGHT,
        width: constants.BUNNY_FLOP_WIDTH
      };
    }

    return {
      height: constants.BUNNY_HEIGHT,
      width: constants.BUNNY_WIDTH,
    };
  }

  /**
   * Clear moving and idle timeouts
   */
  clearTimeouts() {
    clearTimeout(this.movingTimeout);
    clearTimeout(this.idleTimeout);
  }

  /**
   * Returns the keyboard action event
   *
   * @param  {object} e - The key down/up event
   *
   * @return {string} - The string representation of the key event
   */
  getKeyEvent(e) {
    const keycode = e.keyCode;
    return KEYBOARD_EVENTS[keycode];
  }

  /**
   * Handles the Key Down event
   *
   * @param {object} e - The key down event
   */
  setKeyDown(e) {
    e.preventDefault();
    const { moving } = this.state;
    const keyEvent = this.getKeyEvent(e);
    const {
      hero: {
        position: { x, y },
        disableMove
      },
      showMenu
    } = this.props;

    clearTimeout(this.idleTimeout);
    this.idleTimeout = null;

    // Return if movement is disabled
    if (disableMove) {
      return;
    }

    // If player hit a key we don't have an event for, return
    if (!keyEvent) {
      return;
    }

    // Player is toggling the inventory menu, or hitting escape to exit the menu
    if (keyEvent == 'inventory' || keyEvent == 'escape') {
      if (keyEvent == 'inventory' || showMenu) {
        toggleShowMenu();
      }

      return;
    }

    if (keyEvent == 'tab') {
      // Allow tab event when the menu is open
      if (showMenu) {
        changeMenuTab();
      }

      return;
    }

    // Don't allow any key actions while player has the menu open
    if (showMenu) {
      return;
    }


    // If idle status changed, set it to state
    if (this.state.isLoaf || this.state.isFlopped) {
      const newState = {};

      if (this.state.isLoaf) {
        newState.isLoaf = false;
      } else {
        newState.isFlopped = false;
      }

      this.setState(newState);
    }

    // Handle space for collision actions
    if (keyEvent == 'space') {
      if (!moving.length) {
        const useCharacter = this.getCharacterWithDimensions();
        getEntityCollisions(useCharacter, x, y, null, null, true);
      }

      return;
    }

    const oppositeDirection = getOppositeDirection(keyEvent);
    const directionIndex = moving.indexOf(keyEvent);
    const oppositeDirectionIndex = moving.indexOf(oppositeDirection);

    // If player is moving in a new direction that isn't an opposite of another
    // diretion they're already moving, update the state
    if (directionIndex == -1 && oppositeDirectionIndex == -1) {
      this.setState({
        moving: [...moving, keyEvent]
      }, () => {
        // Move the player entity after the state updates
        if (!this.movingTimeout) {
          this.movePlayer();
        }
      });
    }
  }

  /**
   * Handle the Key Up event
   *
   * @param {object} e - The key up event
   */
  setKeyUp(e) {
    const keyEvent = this.getKeyEvent(e);

    // If player hit a key we don't have an event for, return
    if (!keyEvent) {
      return;
    }

    const directionIndex = this.state.moving.indexOf(keyEvent);
    const newMoving = this.state.moving.filter((value, index) => { return index != directionIndex });

    if (directionIndex > -1) {
      // If we're no longer moving in a direction, update the state
      this.setState({
        moving: newMoving
      }, () => {
        if (newMoving.length) {
          // If player is still moving in another direction, keep the entity moving
          this.movePlayer();
        } else {
          // If player is no longer moving, clear moving timeout and set idle timeout
          clearTimeout(this.movingTimeout);
          this.movingTimeout = null;
          this.idleTimeout = setTimeout(this.setHeroIdleStatus.bind(this, 'isLoaf'), 5000);
        }
      });
    }
  }

  /**
   * Sets the hero's idle status to the state
   *
   * @param {string} type - The idle status type, ex: 'isLoaf' or 'isFlopped'
   * @param {bool} value - The idle status value
   */
  setHeroIdleStatus(type, value) {
    const newState = {
      [type]: value || !this.state[type]
    };

    // Flop bunny after loaf status
    if (type == 'isLoaf') {
      this.idleTimeout = setTimeout(this.setHeroIdleStatus.bind(this, 'isFlopped'), 5000);
    } else if (type == 'isFlopped') {
      newState.isLoaf = false;
    }

    this.setState(newState);
  }

  /**
   * Returns the character object with height and width at the top level
   *
   * @return {object} - The new character object
   */
  getCharacterWithDimensions() {
    const { hero: { height, width } } = this.props;
    return {
      ...this,
      height,
      width
    };
  }

  /**
   * Moves the hero entity based on the directions they're going
   */
  movePlayer() {
    const { moving } = this.state;
    const {
      hero: {
        position: { x, y }
      }
    } = this.props;

    let newX = x;
    let newY = y;

    const useCharacter = this.getCharacterWithDimensions();

    for (let m = 0; m < moving.length; m++) {
      switch(moving[m]) {
        case 'up':
          // Move player up on the Y axis
          newY = moveEntityBack(useCharacter, 'y', newX, newY, moving[m], moving.length > 1).value;
          break;
        case 'down':
          // Move player down on the Y axis
          newY = moveEntityForward(useCharacter, 'y', newX, newY, moving[m], moving.length > 1).value;
          break;
        case 'left':
          // Move player left on the X axis
          newX = moveEntityBack(useCharacter, 'x', newX, newY, moving[m], moving.length > 1).value;
          break;
        case 'right':
          // Move player right on the X axis
          newX = moveEntityForward(useCharacter, 'x', newX, newY, moving[m], moving.length > 1).value;
          break;
      }
    }

    updateHeroPosition({ x: newX, y: newY });

    // Keep moving the player for as long as the direction keys are pressed
    this.movingTimeout = setTimeout(this.movePlayer, 120);
  }

  render() {
    const {
      hero: {
        position,
        lastDirection,
        height,
        width
      }
    } = this.props;

    return (
      <Bunny
        name="hero"
        ref={(hero) => { this.hero = hero }}
        height={height}
        width={width}
        position={position}
        direction={lastDirection}
        isFlopped={this.state.isFlopped}
        isLoaf={this.state.isLoaf}
        isMoving={this.state.moving.length}
        bunnyImages={this.bunnyImages}
        id="Hero"
      />
    );
  }
}

export default Hero;
