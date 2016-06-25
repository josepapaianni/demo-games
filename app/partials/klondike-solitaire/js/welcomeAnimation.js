var gsap = require('gsap');

var WelcomeAnimation = function (game, mainGameGroup, welcomeModal, windSound) {
    this.game = game;

    this.logoGroup = this.game.add.group();
    mainGameGroup.add(this.logoGroup);
    this.gameLogo0 = this.logoGroup.create(this.game.world.centerX, this.game.world.centerY, 'intro-logo-0');
    this.gameLogo1 = this.logoGroup.create(this.game.world.centerX, this.game.world.centerY, 'intro-logo-1');
    this.gameLogo2 = this.logoGroup.create(this.game.world.centerX, this.game.world.centerY, 'intro-logo-2');
    this.gameLogo3 = this.logoGroup.create(this.game.world.centerX, this.game.world.centerY, 'intro-logo-3');
    this.gameLogo0.anchor.set(0.5);
    this.gameLogo0.alpha = 1;
    this.gameLogo1.anchor.set(0.5);
    this.gameLogo1.alpha = 1;
    this.gameLogo2.anchor.set(0.5);
    this.gameLogo2.alpha = 1;
    this.gameLogo3.anchor.set(0.5);
    this.gameLogo3.alpha = 1;
    this.logoSolitaire = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY+80, 'solitaire-logo')
    this.logoSolitaire.anchor.set(0.5);
    //setTimeout(welcomeModal, 2000);

    this.particleEmitter = this.game.add.emitter(game.world.centerX, -50, 1000);
    console.log(this.game)
    this.particleEmitter.width = this.game.width;
    this.particleEmitter.makeParticles('flakes');

    this.particleEmitter.minParticleSpeed.setTo(-20, 0);
    this.particleEmitter.maxParticleSpeed.setTo(20, 50);
    this.particleEmitter.minParticleScale = 0.1;
    this.particleEmitter.maxParticleScale = 0.4;
    this.particleEmitter.gravity = 100;

    this.particleEmitter.start(false, 5000, 50);

    //masks
    this.logo1Mask = this.game.add.graphics(50,400);
    this.logo1Mask.beginFill(0x000000);
    this.logo1Mask.drawRect(0,0,700,-150);
    this.logoGroup.add(this.logo1Mask);
    this.gameLogo1.mask = this.logo1Mask;

    this.logo2Mask = this.game.add.graphics(50,250);
    this.logo2Mask.beginFill(0x000000);
    this.logo2Mask.drawRect(0,0,700,180);
    this.logoGroup.add(this.logo2Mask);
    this.gameLogo2.mask = this.logo2Mask;

    this.logo3Mask = this.game.add.graphics(50,450);
    this.logo3Mask.beginFill(0x000000);
    this.logo3Mask.drawRect(0,0,700,-280);
    this.logoGroup.add(this.logo3Mask);
    this.gameLogo3.mask = this.logo3Mask;

    this.logoGroup.add(this.logoSolitaire);
    this.logoGroup.add(this.particleEmitter);

    this.logoGroup.y = this.logoGroup.y - 40;



    TweenMax.from(this.gameLogo0.scale,1,{
        delay: 1,
        x: 0,
        y: 0,
        ease: Elastic.easeOut.config(0.7, 0.3),
        onComplete: function(){
            windSound.play();
        }
    });

    TweenMax.from(this.logo1Mask, 0.5, {
        delay: 1.75,
        y: 520
    });
    TweenMax.from(this.logo2Mask, 0.5, {
        delay: 2.25,
        y: 70
    });
    TweenMax.from(this.logo3Mask, 0.5, {
        delay: 2.75,
        y: 750
    });
    TweenMax.from(this.logoSolitaire, 1 , {
        delay: 3.25,
        y: -100,
        ease: Elastic.easeOut.config(0.5, 0.3),
        onComplete: function () {
            setTimeout(function () {
                this.particleEmitter.on = false;
                welcomeModal();
            }.bind(this),1000)
        },
        onCompleteScope: this
    });

    this.goToHeaderPos = function () {
        TweenMax.to (this.logoGroup.scale, 0.5, {
            x: 0.45,
            y: 0.45
        });
        TweenMax.to (this.logoGroup, 0.5, {
            y: -80,
            x: 225
        })
    }

}

module.exports = WelcomeAnimation;