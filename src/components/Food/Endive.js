import image from 'images/endive.png';

export default class Endive {
  constructor(position, id) {
    this.position = position;
    this.height = 29;
    this.width = 25;
    this.type = 'Endive';
    this.collected = false;
    this.image = image;
    this.id = id;
  }
}
