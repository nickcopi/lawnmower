
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let grasses = [];
let player;
let tick = 0;

let init = ()=>{
	populateGrass(150);
	player = new Player(250,250);
}

let collide = (o1,o2)=>(o1.x < o2.x + o2.width && o1.x + o1.width > o2.x && o1.y < o2.y + o2.height && o1.y + o1.height > o2.y) && o1 !== o2;

let interval = setInterval(()=>{
	update();
	render();
},1000/60);

let update = ()=>{
	if(!tick) init();
	player.move();
	checkCollisions();
	tick++;
}

let checkCollisions = ()=>{
	grasses = grasses.filter(g=>!collide(g,player));
}

let render = ()=>{
	ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.fillStyle = '#228B22';
	ctx.fillRect(0,0,canvas.width,canvas.height);
	ctx.fillStyle = '#008000';
	grasses.forEach(g=>{
		ctx.fillRect(g.x,g.y,g.width,g.height);
	});
	ctx.fillStyle = 'white';
	ctx.fillRect(player.x,player.y,player.width,player.height);
}


let populateGrass = num=>{
	if(num <= 0) return;
	grasses.push(new Grass(Math.floor(Math.random()*(canvas.width-6)),Math.floor(Math.random()*(canvas.height-6)),6,6));
	populateGrass(num-1);
}

const Directions = {
	RIGHT:1,
	LEFT:2,
	UP:3,
	DOWN:4
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


window.addEventListener('keypress',e=>{
	switch(e.key){
		case 'w':
			player.direction = Directions.UP;
		break;
		case 'a':
			player.direction = Directions.LEFT;
		break;
		case 's':
			player.direction = Directions.DOWN;
		break;
		case 'd':
			player.direction = Directions.RIGHT;
		break;
	}
});
