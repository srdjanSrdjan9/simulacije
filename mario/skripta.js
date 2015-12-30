        /*global Quintus:false */

        
        var Q = Quintus()
            .include("Sprites, Scenes, Input, 2D, Touch, UI, Audio")
            .setup({
                width: 960,
                height: 640,
                development: true
            }).controls().touch();

        Q.enableSound();  

        //player
        Q.Sprite.extend("Player",{
            init: function(p) {
              this._super(p, { asset: "player.png", x: 110, y: 50, jumpSpeed: -400, lives: 3, coins: 0, isJumping:false});
              this.add('2d, platformerControls');

              	this.on("hit.sprite",function(collision) {

              	    if(collision.obj.isA("Tree")) {
              	    	Q.audio.play("level-complete.mp3");
              	        Q.stageScene("winGame",1, { label: "You Won" }); 
              	        
              	        this.destroy();
              	    }
                     if(collision.obj.isA("Killer")) {
                       this.destroy();
                       Q.audio.play("lose-life.mp3");
                       Q.stageScene("endGame",1, { label: "Game Over" }); 
                    }
                    if (collision.obj.isA("Coin")) {
                        collision.obj.destroy();
                        this.p.coins++;
                        var coinsLabel = Q("UI.Text",1).items[1];
                        coinsLabel.p.label = 'Coins x '+ this.p.coins;
                        Q.audio.play("coin.mp3");
                    }
              	});
                        
            },
            step: function(dt) {
                if(Q.inputs['left'] && this.p.direction == 'right') {
                    this.p.flip = 'x';
                } 
                if(Q.inputs['right']  && this.p.direction == 'left') {
                    this.p.flip = false;                    
                }
                var inAir = false;
                if(Q.inputs['up'] && !inAir) {
                	    Q.audio.play("jump.mp3");
                	    inAir = true;
                	    if(Q.inputs['left'] || Q.inputs['right'] ||Q.inputs['bottom'])
                	    	inAir = false;
                }

                if(this.p.timeInvincible > 0) {
                        this.p.timeInvincible = Math.max(this.p.timeInvincible - dt, 0);
                    }
            },
            damage: function() {
            	//only damage if not in "invincible" mode, otherwise beign next to an enemy takes all the lives inmediatly
            	   if(!this.p.timeInvincible) {
            	       this.p.lives--;

            	       //play sound for lost life
            	       Q.audio.play("lose-life.mp3");
            	       
            	       //will be invincible for 2 second
            	       this.p.timeInvincible = 2;
            	       
            	       if(this.p.lives == 0) {
            	           this.destroy();
            	           Q.stageScene("endGame",1, { label: "Game Over" }); 
            	       }
            	       else {
            	           var livesLabel = Q("UI.Text",1).first();
            	           livesLabel.p.label = "Lives x "+this.p.lives;
            	       }
            	   }
            }  
          });                      
        
        Q.scene("level1",function(stage) {          
            var background = new Q.TileLayer({ dataAsset: 'level1.tmx', layerIndex: 0, sheet: 'tiles', tileW: 70, tileH: 70, type: Q.SPRITE_NONE });
            stage.insert(background);            
            stage.collisionLayer(new Q.TileLayer({ dataAsset: 'level1.tmx', layerIndex:1,  sheet: 'tiles', tileW: 70, tileH: 70 }));          
            var player = stage.insert(new Q.Player());            
            stage.add("viewport").follow(player,{x: true, y: true},{minX: 0, maxX: background.p.w, minY: 0, maxY: background.p.h});
            //level assets. format must be as shown: [[ClassName, params], .. ] 
            var levelAssets = [
                ["GroundEnemy", {x: 18*70, y: 6*70, asset: "slime.png"}],
                ["VerticalEnemy", {x: 800, y: 120, rangeY: 70, asset: "fly.png"}],
                ["VerticalEnemy", {x: 900, y: 60, rangeY: 30, asset: "fly.png"}],
                ["VerticalEnemy", {x: 1080, y: 120, rangeY: 80, asset: "fly.png"}],
                ["VerticalEnemy", {x: 2240, y: 120, rangeY: 80, asset: "fly.png"}],
                ["VerticalEnemy", {x: 2240, y: 320, rangeY: 80, asset: "fly.png"}],
                ["VerticalEnemy", {x: 2540, y: 320, rangeY: 80, asset: "fly.png"}],
                ["GroundEnemy", {x: 6*70, y: 3*70, asset: "slime.png"}],
                ["GroundEnemy", {x: 8*70, y: 70, asset: "slime.png"}],
                ["GroundEnemy", {x: 18*70, y: 120, asset: "slime.png"}],
                ["GroundEnemy", {x: 12*70, y: 120, asset: "slime.png"}],
                ["Killer", {x: 1650, y: 463, asset: "killer.png"}],
                ["Coin", {x: 300, y: 100}],
                ["Coin", {x: 360, y: 100}],
                ["Coin", {x: 420, y: 100}],
                ["Coin", {x: 480, y: 100}],
                ["Coin", {x: 800, y: 300}],
                ["Coin", {x: 860, y: 300}],
                ["Coin", {x: 920, y: 300}],
                ["Coin", {x: 980, y: 300}],
                ["Coin", {x: 1040, y: 300}],
                ["Coin", {x: 1100, y: 300}],
                ["Coin", {x: 1160, y: 300}],
                ["Coin", {x: 1250, y: 400}],
                ["Coin", {x: 1310, y: 400}],
                ["Coin", {x: 1370, y: 400}],
                ["Coin", {x: 1850, y: 400}],
                ["Tree", {x: 2650, y: 90}]
            ];            
            //load level assets
            stage.loadAssets(levelAssets);           
        });
        Q.scene("endGame",function(stage) {
            alert("game over");
            window.location = "";
        });
        Q.scene("winGame",function(stage) {
            alert("Congratulations. You Won!!!");
            window.location = "";
        });
        Q.scene("gameStats", function(stage) {
            var statsContainer = stage.insert(new Q.UI.Container({
                fill: "gray",
                x: 960/2,
                y: 620,
                border: 1,
                shadow: 3,
                shadowColor: "rgba(0,0,0,0.5)",
                w: 960,
                h: 40
                })
            );                
            var lives = stage.insert(new Q.UI.Text({ 
                    label: "Lives x 3",
                    color: "white",
                    x: -300,
                    y: 0
                }),statsContainer);            
            var coins = stage.insert(new Q.UI.Text({ 
                    label: "Coins x 0",
                    color: "white",
                    x: 300,
                    y: 0
                }),statsContainer);
        });      
        
        //load assets
        Q.load("tiles_map.png, player.png, level1.tmx, fly.png, slime.png, coin.png,killer.png, Tree.png, coin.mp3, jump.mp3, kill-enemy.mp3, lose-life.mp3 ,level-complete.mp3", function() {
          Q.sheet("tiles","tiles_map.png", { tilew: 70, tileh: 70});          
          Q.stageScene("level1");
          Q.stageScene("gameStats",1);
        });

        //component for common enemy behaviors
        Q.component("commonEnemy", {
            added: function() {
                var entity = this.entity;
                entity.on("bump.left,bump.right",function(collision) {
                    if(collision.obj.isA("Player")) {  
                    	collision.obj.damage();
                    }
                });
                entity.on("bump.bottom",function(collision){
                	if(collision.obj.isA("Player")) {  
                    	collision.obj.damage();
                    }
                });
                entity.on("bump.top",function(collision) {
                    if(collision.obj.isA("Player")) { 
                        //make the player jump
                        collision.obj.p.vy = -100;

                        //play sound
                        Q.audio.play("kill-enemy.mp3");
                        
                        //kill enemy
                        this.destroy();
                    }
                });
            },
        });
        //enemy that goes up and down
        Q.Sprite.extend("VerticalEnemy", {
            init: function(p) {
                this._super(p, {vy: -100, rangeY: 200, gravity: 0 });
                this.add("2d, commonEnemy");                
                this.p.initialY = this.p.y; 
                this.p.initialVy = this.p.vy;
                this.p.vyDirection = this.p.vy/Math.abs(this.p.vy);
                var that = this;
                this.on("bump.top, bump.bottom",function(collision) {
                	that.p.vy = -Math.abs(that.p.initialVy) * that.p.vyDirection;
                	that.p.vyDirection = that.p.vy/Math.abs(that.p.vy);
                });
                
            },
            step: function(dt) {                
                if(this.p.y - this.p.initialY >= this.p.rangeY && this.p.vy > 0) {
                    this.p.vy = -this.p.vy;
                    this.p.vyDirection *= -1;

                } 
                else if(-this.p.y + this.p.initialY >= this.p.rangeY && this.p.vy < 0) {
                    this.p.vy = -this.p.vy; 
                    this.p.vyDirection *= -1;
                } 
            }
        });
		//enemy that walks around          
		Q.Sprite.extend("GroundEnemy", {
		    init: function(p) {
		        this._super(p, {vx: -100, defaultDirection: "left"});
		        this.add("2d, aiBounce, commonEnemy");                
		    },
		    step: function(dt) { 
		    	var dirX = this.p.vx/Math.abs(this.p.vx);
		    	   var ground = Q.stage().locate(this.p.x, this.p.y + this.p.h/2 + 1, Q.SPRITE_DEFAULT);
		    	   var nextTile = Q.stage().locate(this.p.x + dirX * this.p.w/2 + dirX, this.p.y + this.p.h/2 + 1, Q.SPRITE_DEFAULT);
		    	   
		    	   //if we are on ground and there is a cliff
		    	   if(!nextTile && ground) {
		    	       if(this.p.vx > 0) {
		    	           if(this.p.defaultDirection == "right") {
		    	               this.p.flip = "x";
		    	           }
		    	           else {
		    	               this.p.flip = false;
		    	           }
		    	       }
		    	       else {
		    	           if(this.p.defaultDirection == "left") {
		    	               this.p.flip = "x";
		    	           }
		    	           else {
		    	               this.p.flip = false;
		    	           }
		    	       }
		    	       this.p.vx = -this.p.vx;
		    	   }
		    }
		});
    Q.Sprite.extend("Killer", {
            init: function(p) {
                this._super(p, {asset: "killer.png"});
            }            
        });
		Q.Sprite.extend("Coin", {
		    init: function(p) {
		        this._super(p, {asset: "coin.png"});
		    }            
		});

		Q.Sprite.extend("Tree", {
		  init: function(p) {
		    this._super(p, { asset: "Tree.png"});
		  }
		});
