let game;

const Directions = {
	RIGHT:1,
	LEFT:2,
	UP:3,
	DOWN:4
}

const Items = {
	GRASS:0
}

class Game{
	constructor(canvas){
		this.canvas = canvas;
		this.doBuy.bind(this);
		this.wallet = {
			money:0,
			items: new ItemManager()
		};
		this.scene = new GrassScene(canvas,this.wallet);
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
		return (o1.x < o2.x + o2.width && o1.x + o1.getWidth() > o2.x && o1.y < o2.y + o2.height && o1.y + o1.getHeight() > o2.y) && o1 !== o2;
	}

}

class GrassScene extends Scene{
	constructor(canvas,wallet){
		super(canvas);
		this.grasses = [];
		this.ui = {};
		this.tick = 0;
		this.populateGrass(150);
		this.player = new Player(250,250);
		this.setupMenu(wallet);
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
	setupMenu(wallet){
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
		
		/*Generate items*/
		wallet.items.list.forEach((item,i)=>{
			const baseLeft = 12.5 + 20;
			const baseTop = 512.5 + 10; 
			let x = baseLeft + (i*30)%270;
			let y = baseTop + (Math.floor((i*30)/270) * 30);
			item.img.style.left = x + 'px';
			item.img.style.top = y + 'px';
			item.img.className = 'item';
			let hoverBox;
			item.img.addEventListener('mouseover',(e)=>{
				hoverBox = document.createElement('div');
				hoverBox.className = 'hoverBox';
				hoverBox.style.left = e.clientX - 40 + 'px';
				hoverBox.style.top = e.clientY - 100 + 'px';
				hoverBox.innerText = `Grass\n Sell price: ${item.cost}`;
				this.ui.baseUI.appendChild(hoverBox);
			});
			item.img.addEventListener('mouseout',(e)=>{
				hoverBox.remove();
			});
			item.img.addEventListener('click',e=>{
				item.sell(game.wallet);
			});
			let counter = document.createElement('div');
			counter.className = 'itemCounter';
			counter.style.left = x + 15 + 'px';
			counter.style.top = y + 15 + 'px';
			this.ui.baseUI.appendChild(item.img);
			this.ui.baseUI.appendChild(counter);
		});
		/*add references to UI object*/
		this.ui.upgradeUI = [...document.querySelectorAll('.upgrade')];
		this.ui.counters = [...document.querySelectorAll('.itemCounter')];
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
		this.ui.counters.forEach((counter,i)=>{
			counter.innerText = game.wallet.items.list[i].count;
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
		ctx.fillRect(this.player.x,this.player.y,this.player.getWidth(),this.player.getHeight());
	}
	checkCollisions(){
		this.grasses = this.grasses.filter(harvest=>{
			let didCollide = this.collide(this.player,harvest)
			if(didCollide){
				game.wallet.items.list[harvest.type].count++;
			}
			return !didCollide;
		});
		if(!this.grasses.length) this.populateGrass(150);
	}
	populateGrass(num){
		if(num <= 0) return;
		this.grasses.push(new Grass(Math.floor(Math.random()*(this.canvas.width-6)),Math.floor(Math.random()*(this.canvas.height-6)),6,6));
		this.populateGrass(num-1);
	}

}



class Harvestable{
	constructor(x,y,width,height){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
}

class Grass extends Harvestable{
	constructor(x,y,width,height){
		super(x,y,width,height);
		this.type = Items.GRASS;
	}
}

class Player{
	constructor(x,y){
		this.x = x;
		this.y = y;
		this.baseWidth = 30;
		this.baseHeight = 30;
		this.direction = Directions.RIGHT;
		this.baseSpeed = 3;
		this.upgrades = new UpgradeManager();
	}
	getSpeed(){
		return this.baseSpeed + this.baseSpeed * this.upgrades.speedUpgrade.getBonus();
	}
	getHeight(){
		return this.baseHeight + this.baseHeight * this.upgrades.sizeUpgrade.getBonus();
	}
	getWidth(){
		return this.baseWidth + this.baseWidth * this.upgrades.sizeUpgrade.getBonus();
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
		if(this.x > canvas.width - this.getWidth()) this.x = canvas.width-this.getWidth();
		if(this.y < 0) this.y = 0;
		if(this.y > canvas.height - this.getHeight()) this.y = canvas.height-this.getHeight();
	}

}

class Upgrade{
	constructor(cost,name,desc){
		this.level = 0;
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
		super(1,'Speed','Make vehicle move faster');

	}
	/*return bonus as a decimal multiplier*/
	getBonus(level=this.level){
		return level*level/50;
	}
	getText(){
		return `${this.desc} by ${this.getBonus(this.level+1) * 100}%.`;
	}

}
class SizeUpgrade extends Upgrade{
	constructor(){
		super(1,'Size','Make vehicle bigger');

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
		this.sizeUpgrade = new SizeUpgrade();
		this.list = [this.speedUpgrade,this.sizeUpgrade];
	}
}

class Item{
	constructor(name,cost){
		this.name = name;
		this.cost = cost;
		this.count = 0;
	}
	sell(wallet){
		let usedCount = (this.count > 5)?5:this.count;
		wallet.money += this.cost * usedCount;
		this.count -= usedCount;
	}
}

class GrassItem extends Item{
	constructor(){
		super('Grass',2);
		this.img = new Image();
		this.img.src = 'images/grass.png';
	}

}


class ItemManager{
	constructor(){
		this.grass = new GrassItem();
		this.list = [this.grass];
		//this.list = [new GrassItem(),new GrassItem(),new GrassItem(),new GrassItem(),new GrassItem(),new GrassItem(),new GrassItem(),new GrassItem(),new GrassItem(),new GrassItem(),new GrassItem(),new GrassItem(),new GrassItem(),new GrassItem(),new GrassItem(),new GrassItem(),new GrassItem(),new GrassItem()];
	}

}


window.addEventListener('load',()=>{
	game = new Game(document.getElementById('canvas'));
});
