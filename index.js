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
		this.doBuy.bind(this);
		this.scene = new GrassScene(canvas,game);
		this.wallet = {
			money:0
		};
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
	doBuy(buy){
		buy(this.wallet);
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
	constructor(canvas,game){
		super(canvas);
		this.game = game;
		this.grasses = [];
		this.ui = {};
		this.tick = 0;
		this.populateGrass(150);
		this.player = new Player(250,250);
		this.setupMenu();
		this.interval = setInterval(()=>{
			this.update();
			this.updateMenu();
			this.render();
		},1000/60);
	}
	update(){
		this.player.move();
		this.checkCollisions();
		this.tick++;
	}
	setupMenu(){
		/*setup UI holder*/
		this.ui.baseUI = document.getElementById('UIHolder');
		this.ui.baseUI.innerHTML = '';
		
		/*setup right bar*/
		let rightBar = document.createElement('div');
		rightBar.className = 'rightBar';
		this.ui.baseUI.appendChild(rightBar);

		/*setup bottom bar*/
		let bottomBar = document.createElement('div');
		bottomBar.className = 'bottomBar';
		this.ui.baseUI.appendChild(bottomBar);
		
		/*setup item bar*/
		let itemBar = document.createElement('div');
		itemBar.className = 'itemBar';
		this.ui.baseUI.appendChild(itemBar);
		
		/*setup money text*/
		let moneyText = document.createElement('div');
		moneyText.className = 'moneyText';
		this.ui.baseUI.appendChild(moneyText);

		/*Generate upgrade buttons*/
		this.player.upgrades.list.forEach((u,i)=>{
			let upgrade = document.createElement('div');
			upgrade.style.top = 100 * i + 'px';
			upgrade.className = 'upgrade';
			upgrade.addEventListener('click',()=>{
				game.doBuy(u.buy.bind(u));
			});
			this.ui.baseUI.appendChild(upgrade);
		});
	
		/*add references to UI object*/
		this.ui.upgradeUI = [...document.querySelectorAll('.upgrade')];
		this.ui.moneyDisplay = document.getElementById('money');
		this.ui.rightBar = rightBar;
		this.ui.bottomBar = bottomBar;
		this.ui.itemBar = itemBar;
		this.ui.moneyText = moneyText;

	}
	updateMenu(){
		this.ui.upgradeUI.forEach((ui,i)=>{
			let upgrade = this.player.upgrades.list[i];
			ui.innerHTML = `<b>${upgrade.name}</b><br>${upgrade.getText()}<br>$${upgrade.getCost()}`;
		});
		this.ui.moneyText.innerText = `Money: $${game.wallet.money}`;
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
		this.baseSpeed = 3;
		this.upgrades = new UpgradeManager();
	}
	getSpeed(){
		return this.baseSpeed + this.baseSpeed * this.upgrades.speedUpgrade.getBonus();
	}
	move(){
		switch(this.direction){
			case Directions.LEFT:
				this.x -= this.getSpeed();
			break;
			case Directions.RIGHT:
				this.x += this.getSpeed();
			break;
			case Directions.UP:
				this.y -= this.getSpeed();
			break;
			case Directions.DOWN:
				this.y += this.getSpeed();
			break;
		}
		if(this.x < 0) this.x = 0;
		if(this.x > canvas.width - this.width) this.x = canvas.width-this.width;
		if(this.y < 0) this.y = 0;
		if(this.y > canvas.height - this.height) this.y = canvas.height-this.height;
	}

}

class Upgrade{
	constructor(level,cost,name,desc){
		this.level = level;
		/*cost as a sort of multiplier*/
		this.cost = cost;
		this.name = name;
		this.desc = desc;
	}
	getCost(){
		/*Probably tweak the cost formula*/
		return this.cost * (this.level+1) * (this.level+1) + 20;
	}
	buy(wallet){
		const price = this.getCost();
		if(wallet.money < price)
			return `Cannot afford. Need $${price-wallet.money} more!`
		wallet.money -= price;
		this.level++;
		return 'Upgrade purchased';
	}
}
class SpeedUpgrade extends Upgrade{
	constructor(){
		super(0,1,'Speed','Make vehicle move faster');

	}
	/*return bonus as a decimal multiplier*/
	getBonus(level=this.level){
		return level*level/50;
	}
	getText(){
		return `${this.desc} by ${this.getBonus(this.level+1) * 100}%.`;
	}

}
class UpgradeManager{
	constructor(){
		this.speedUpgrade = new SpeedUpgrade();
		this.list = [this.speedUpgrade];

	}
}



window.addEventListener('load',()=>{
	game = new Game(document.getElementById('canvas'));
});
