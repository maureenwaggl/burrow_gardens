import image from 'images/bokchoy.png';

export default class BokChoy {
  constructor(position, id) {
    this.position = position;
    this.height = 27;
    this.width = 18;
    this.type = 'BokChoy';
    this.collected = false;
    this.image = image;
    this.id = id;
  }
}
