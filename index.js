let game;

const Directions = {
	RIGHT:1,
	LEFT:2,
	UP:3,
	DOWN:4
}

class Game{
	constructor(canvas){
		this.canvas = canvas;
		this.scene = new GrassScene(canvas);

	window.addEventListener('keypress',e=>{
		switch(e.key){
			case 'w':
				this.scene.player.direction = Directions.UP;
			break;
			case 'a':
				this.scene.player.direction = Directions.LEFT;
			break;
			case 's':
				this.scene.player.direction = Directions.DOWN;
			break;
			case 'd':
				this.scene.player.direction = Directions.RIGHT;
			break;
		}
	});
	}
}


class Scene{
	constructor(canvas){
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
	}
	collide(o1,o2){
		return (o1.x < o2.x + o2.width && o1.x + o1.width > o2.x && o1.y < o2.y + o2.height && o1.y + o1.height > o2.y) && o1 !== o2;
	}

}

class GrassScene extends Scene{
	constructor(canvas){
		super(canvas);
		this.grasses = [];
		this.tick = 0;
		this.populateGrass(150);
		this.player = new Player(250,250);
		this.interval = setInterval(()=>{
			this.update();
			this.render();
		},1000/60);
	}
	update(){
		this.player.move();
		this.checkCollisions();
		this.tick++;
	}
	render(){
		let ctx = this.ctx;
		let canvas = this.canvas;
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.fillStyle = '#228B22';
		ctx.fillRect(0,0,canvas.width,canvas.height);
		ctx.fillStyle = '#008000';
		this.grasses.forEach(g=>{
			ctx.fillRect(g.x,g.y,g.width,g.height);
		});
		ctx.fillStyle = 'white';
		ctx.fillRect(this.player.x,this.player.y,this.player.width,this.player.height);
	}
	checkCollisions(){
		this.grasses = this.grasses.filter(g=>!this.collide(g,this.player));
	}
	populateGrass(num){
		if(num <= 0) return;
		this.grasses.push(new Grass(Math.floor(Math.random()*(this.canvas.width-6)),Math.floor(Math.random()*(this.canvas.height-6)),6,6));
		this.populateGrass(num-1);
	}

}


class Grass{
	constructor(x,y,width,height){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
}

class Player{
	constructor(x,y){
		this.x = x;
		this.y = y;
		this.width = 30;
		this.height = 30;
		this.direction = Directions.RIGHT;
		this.speed = 3;
	}
	move(){
		switch(this.direction){
			case Directions.LEFT:
				this.x -= this.speed;
			break;
			case Directions.RIGHT:
				this.x += this.speed;
			break;
			case Directions.UP:
				this.y -= this.speed;
			break;
			case Directions.DOWN:
				this.y += this.speed;
			break;
		}
		if(this.x < 0) this.x = 0;
		if(this.x > canvas.width - this.width) this.x = canvas.width-this.width;
		if(this.y < 0) this.y = 0;
		if(this.y > canvas.height - this.height) this.y = canvas.height-this.height;
	}

}



window.addEventListener('load',()=>{
	game = new Game(document.getElementById('canvas'));
});
