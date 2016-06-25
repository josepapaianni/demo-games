var CircleSection = function (game, x, y, radius, color, angle) {

  this._radius = radius;
  this._progress = 1;
  this.bmp = game.add.bitmapData(radius * 2, radius * 2);
  Phaser.Sprite.call(this, game, x, y, this.bmp);

  //this.anchor.set(0.5);
  this.angle = angle || -90;
  this.color = color || "#fff";
  this.updateProgress();
  game.world.add(this);
};

CircleSection.prototype = Object.create(Phaser.Sprite.prototype);
CircleSection.prototype.constructor = CircleSection;

CircleSection.prototype.updateProgress = function () {
  var progress = this._progress;
  progress = Phaser.Math.clamp(progress, 0.00001, 0.99999);

  this.bmp.clear();
  this.bmp.ctx.fillStyle = this.color;
  this.bmp.ctx.beginPath();
  this.bmp.ctx.arc(this._radius, this._radius, this._radius, 0, (Math.PI * 2) * progress, true);
  this.bmp.ctx.lineTo(this._radius, this._radius);
  this.bmp.ctx.closePath();
  this.bmp.ctx.fill();
  this.bmp.dirty = true;
};


Object.defineProperty(CircleSection.prototype, 'progress', {
  get: function () {
    return this._progress;
  },
  set: function (val) {
    this._progress = val;
    this.updateProgress();
  }
});

module.exports = CircleSection;