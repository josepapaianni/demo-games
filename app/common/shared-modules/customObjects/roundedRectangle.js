var RoundedRectangle = function (game, x, y, width, height, borderRadius, fill, stroke, strokeWidth) {

  this.bmp = game.add.bitmapData(width, height);
  Phaser.Sprite.call(this, game, x, y, this.bmp);

  this.bmp.clear();

  this.bmp.ctx.beginPath();
  this.bmp.ctx.moveTo(borderRadius, 0);
  this.bmp.ctx.lineTo(width-borderRadius, 0);
  this.bmp.ctx.quadraticCurveTo(width, 0, width, borderRadius);
  this.bmp.ctx.lineTo(width, height-borderRadius);
  this.bmp.ctx.quadraticCurveTo(width,height,width-borderRadius,height);
  this.bmp.ctx.lineTo(borderRadius,height);
  this.bmp.ctx.quadraticCurveTo(0,height,0,height-borderRadius);
  this.bmp.ctx.lineTo(0, borderRadius);
  this.bmp.ctx.quadraticCurveTo(0, 0, borderRadius, 0);
  this.bmp.ctx.closePath();

  if (fill){
    this.bmp.ctx.fillStyle = fill;
    this.bmp.ctx.fill();
  };

  if (stroke){
    this.bmp.ctx.strokeStyle = stroke;
    this.bmp.ctx.lineWidth = strokeWidth;
    this.bmp.ctx.stroke();
  };

  this.bmp.dirty = true;
  game.world.add(this);
};

RoundedRectangle.prototype = Object.create(Phaser.Sprite.prototype);
RoundedRectangle.prototype.constructor = RoundedRectangle;

module.exports = RoundedRectangle;