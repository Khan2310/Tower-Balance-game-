var world;
var changePos = true;
var currPosX;
var currPosY;
var count = 0;
var shapeArray = [];
var setClick = true;
var groundHight = 80;
var findFallingBlock = 1;
var scorePoint = 0;
var game = cc.Layer.extend({
  init: function() {
    this._super();

    var size = cc.winSize;

    var backgroundSprite = cc.Sprite.create(res.background_png);
    this.addChild(backgroundSprite);

    /////////////Schedule Update/////////////////////////
    // var timeCallback = function(dt) {
    //   cc.log("time: " + dt);
    // };
    // this.schedule(timeCallback, 5);
    /////////////Schedule Update end/////////////////////////

    //this.addChild(newSprite);

    world = new cp.Space();
    world.gravity = cp.v(0, -80);
    var debugDraw = cc.PhysicsDebugNode.create(world);
    debugDraw.setVisible(true);
    this.addChild(debugDraw);
    this.addBody(450, 5, 1200, groundHight, false, res.ground_png, "ground"); // array[0]
    this.addBody(500, 71, 250, 50, false, res.base_png, "solid"); //static base
    this.addBody(420, 600, 40, 60, false, res.downArrow_png, "spawner"); //block static
    //this.addBody(505, 50, 60, 0.5, false, null, "solid"); //Bottom Static // array[1]

    var scoreText = null;
    scoreText = new cc.LabelTTF("Score: ", "Arial", 30);
    scoreText.color = cc.color(255, 0, 55);
    scoreText.setPosition(cc.p(120, 570));
    this.addChild(scoreText);
    var timeCallback = function(dt) {
      count = count + 1;
      //findFallingBlock = findFallingBlock + 1;
      //cc.log("time: " + count);
      if (changePos) {
        changePos = false;
      } else {
        changePos = true;
      }
    };
    this.schedule(timeCallback, 2);
    this.scheduleUpdate();
    var self = this;
    cc.eventManager.addListener(
      {
        event: cc.EventListener.TOUCH_ONE_BY_ONE,
        onTouchBegan: function(touch, event) {
          console.log("clicked");
          setClick = true;
          self.spawnBlock();
        }
      },
      this
    );
    world.setDefaultCollisionHandler(this.collisionBegin, null, null, null);
  },
  addBody: function(posX, posY, width, height, isDynamic, spriteImage, type) {
    // create the physics body somehow
    if (isDynamic) {
      if (isDynamic == "solid") {
        var body = new cp.Body(Infinity, Infinity);
      } else {
        var body = new cp.Body(50000, cp.momentForBox(50000, width, height));
      }
    } else {
      var body = new cp.Body(Infinity, Infinity);
    }
    body.setPos(cp.v(posX, posY));
    var bodySprite = cc.Sprite.create(spriteImage);
    gameLayer.addChild(bodySprite, 0); //adding assets/own property/sprite
    bodySprite.setPosition(posX, posY);
    if (isDynamic) {
      world.addBody(body);
    }
    var shape = new cp.BoxShape(body, width, height);
    shape.setFriction(10000);
    shape.setElasticity(0);
    shape.name = type;
    shape.image = bodySprite;
    world.addShape(shape);
    shapeArray.push(shape);
  },
  update: function(dt) {
    // update the world somehow
    world.step(dt);
    for (var i = shapeArray.length - 1; i >= 0; i--) {
      shapeArray[i].image.x = shapeArray[i].body.p.x;
      shapeArray[i].image.y = shapeArray[i].body.p.y;
      var angle = Math.atan2(
        -shapeArray[i].body.rot.y,
        shapeArray[i].body.rot.x
      );
      shapeArray[i].image.rotation = angle * 57.2957795;
    }
    var blockBodyU1 = shapeArray[2].getBody();
    currPosX = blockBodyU1.p.x;
    currPosY = blockBodyU1.p.y;
    if (changePos) {
      blockBodyU1.setPos(cp.v(blockBodyU1.p.x + 2, blockBodyU1.p.y));
    } else {
      blockBodyU1.setPos(cp.v(blockBodyU1.p.x - 2, blockBodyU1.p.y));
    }
    this.scoreLabel(scorePoint);
  },
  collisionBegin: function(arbiter, space) {
    if (
      (arbiter.a.name == "destroyable" && arbiter.b.name == "solid") ||
      (arbiter.b.name == "destroyable" && arbiter.a.name == "solid") ||
      (arbiter.a.name == "destroyable" && arbiter.b.name == "destroyable")
    ) {
      if (setClick) {
        setClick = false;
        scorePoint += 1;
      }
      //scorePoint += 1;
      console.log("On block top!!!!");
      // space.addPostStepCallback(function() {
      //   space.removeShape(shapeArray[findFallingBlock]);
      // });
    } else if (arbiter.a.name == "destroyable" && arbiter.b.name == "ground") {
      setClick = true;
      console.log("On ground top!!!!");
      cc.director.end();
    }

    return true;
  },
  spawnBlock: function() {
    this.addBody(
      currPosX,
      currPosY,
      120,
      40,
      true,
      res.rectangleBigBox_png,
      "destroyable"
    ); //rectang box
  },
  scoreLabel: function(score) {
    this.removeChildByTag(1, true);
    var scoreNum = null;
    var scoreNumString = String(score);
    scoreNum = new cc.LabelTTF(scoreNumString, "Arial", 30);
    scoreNum.setTag(1);
    scoreNum.color = cc.color(255, 0, 55);
    scoreNum.setPosition(cc.p(175, 570));
    this.addChild(scoreNum);
  }
});
// var touchListener = cc.EventListener.create({
//   event: cc.EventListener.TOUCH_ONE_BY_ONE,
//   onTouchBegan: function(touch, event) {
//     if (setClick == true) {
//       for (var i = 0; i < shapeArray.length; i++) {
//         if (shapeArray[i].name == "destroyable") {
//           setClick = true;
//         }
//       }
//     }
//   }
// });

var gameScene = cc.Scene.extend({
  onEnter: function() {
    this._super();
    gameLayer = new game();
    gameLayer.init();
    this.addChild(gameLayer);
  }
});
