/*
* @Author Anders Knospe
* Last Edited: 10/18/2019
*
* Rendering functionality, includes:
* - 
* - Moveset (class) defines movement of objects, primarily cards
* - Movement and Rendering for the following are defined in the classes below:
*   - Card (class)
*   - Rack (class)
*   - Deck (class) 
* - Easing functions
*/

/*
* Easing functions change time input to cause an ease in or out effect
*/
function easeInOut(t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 }

function easeIn(t) { return t*t*t }

function easeOut(t) { return (--t)*t*t+1 }

function easeNone(t) { return t } 

/*
* Move sets determine are simply wrappers for information describing how and where a card (or other "physical" object) should move. Interpreted by those objects 
*/
class MoveSet{
  constructor(target, duration=1, fr=this.rotation, moveFunction=easeNone){
    this.duration = duration;     // (Integer): how long the transition should take
    this.target = target.copy();  // (3D Vector): destination location for card
    this.target_rotation = fr;    // (3D Vector): what the rotation of the card should be at the destination
    this.moveFunction = moveFunction; // (func): easing function determes how card should transition in & out of moveset
  } 
}

/*
* The Card object defines the appearance and movement of cards - it has no functionality from an AI/logic perspective
*/
class Card { 
  constructor(number, pos, logo, back, size = 60, rotation = createVector(0,0,0)) {  
    this._height = size*2;
    this._width = size*3;
    
    this.number = number;
    this.size = size;
    this.logo = logo; // loaded logo image
    this.back = back; // loaded back image
    
    this.front_txtr = this.get_front_render(); // front texture (for display)
    this.back_txtr = this.get_back_render(); // back texture (for display)
    
    this.pos = pos; // vector position of center of card
    this.rotation = rotation; // vector rotation of card
    this.target_rotation = rotation; // vector rotation currently being approached
    this.dest = createVector(0,0,0); // vector position currently being approached
    this.start = 0;
    this.duration = 0;
    
    this.is_moving = false;
    this.scaled_time = 0; // starts as 1 as too initialized movement
    
    this.moves_queue = []; // moves_queue is a list of all actions that need to be done
    this.moves_queue.push(new MoveSet(pos,0.1,rotation)); // buffer move to avoid having nothing on the queue
    this.begin_move(this.moves_queue[0]); //begin the buffer move
  }
  
  // set associated moving variables equal to the moveset
  begin_move(moveset) {
  	this.start_time = millis();
    this.start = this.pos.copy(); // start pos
    this.is_moving = true;
    
    this.duration = moveset.duration;
    this.dest = moveset.target.copy();
    this.target_rotation = moveset.target_rotation;
    this.moveFunction = moveset.moveFunction;
  }
  
  //step along current move path and render self
  step_and_render() {
    let done = false;
    if (this.scaled_time > 1) { //if finished motion currently on
      this.rotation = this.target_rotation.copy();
      this.pos = this.dest.copy();
      if (this.moves_queue.length > 1) {
        this.moves_queue = this.moves_queue.slice(1); //remove first item of queue (one currently on);
      	this.begin_move(this.moves_queue[0]);
        this.scaled_time = 0; //this will not "stick", just exists so won't double hit this if statement
      } else {
        done = true; 
      }
      
      
    } else { //if still doing motion currently on
      let s_2_d = p5.Vector.sub(this.dest,this.start);
      this.scaled_time = (millis() - this.start_time)/1000.0/this.duration;
	
      this.pos.x = this.start.x + s_2_d.x*this.moveFunction(this.scaled_time); 
      this.pos.y = this.start.y + s_2_d.y*this.moveFunction(this.scaled_time); 
      this.pos.z = this.start.z + s_2_d.z*this.moveFunction(this.scaled_time); 
      
    }
    push()
    //REPOSITION
    translate(this.pos.x-width/2,this.pos.y-height/2,this.pos.z);
    rotateY(scale(this.moveFunction(this.scaled_time),0,1,this.rotation.y,this.target_rotation.y));
    rotateX(scale(this.moveFunction(this.scaled_time),0,1,this.rotation.x,this.target_rotation.x));
    rotateZ(scale(this.moveFunction(this.scaled_time),0,1,this.rotation.z,this.target_rotation.z));
    //FRONT
    texture(this.back_txtr);
    
    plane(this.size*3,this.size*2);
    //BACK
    translate(0,0,0.1);
    texture(this.front_txtr);
    plane(this.size*3,this.size*2);
    pop()
    return done;
  }
  
  // generates front texture for card
  get_front_render() {
    let fr = createGraphics(this.size*3,this.size*2);
    fr.push();
    fr.translate(this.size*3/2,this.size);
    fr.stroke(100); //fr.noStroke();
    fr.rectMode(CENTER);
    fr.imageMode(CENTER);
    fr.textAlign(CENTER,CENTER);
    fr.fill(color(249,248,240));
    fr.rect(0,0,this.size*3,this.size*2,4,4,4,4);
    fr.image(this.logo,0,0,this.size*3/2,this.size);

    fr.textSize(this.size/3.0);
    fr.fill(0);
    var scld = scale(this.number,1,61,-this.size*3/2 + this.size/5,this.size*3/2 - this.size/5);
    fr.text(this.number,scld,-this.size+this.size/5);

    fr.translate(-scld,this.size-this.size/5);
    fr.rotate(PI);
    fr.text(this.number,0,0);

    fr.pop(); 
    this.front_txtr = fr;
    return fr;
  }
  
  // generates back texture for card
  get_back_render() {
  	let ba = createGraphics(this.size*3,this.size*2);
    ba.push();
    ba.scale(-1.0,1.0);
		ba.translate(-this.size*3,0);
    ba.image(this.back,0,0,this.size*3,this.size*2);
    ba.pop();
    this.back_txtr = ba;
    return ba;
  }
  
  // card exits rack, currently just yeets itself into sky
  exitRack() { 
    this.moves_queue.push(new MoveSet(createVector(0,-120,0).add(this.pos),1,this.rotation));
  }
}

/*
* The Rack object defines the appearance of cards
*/
class Rack {
  constructor(_pos) {
    this._width = 220;
    this._height = 60;
    this._depth = 30;
    this._slot_depth = 15;
    this.num_slots = 10;
    this.txtr = _red;
    this.pos = _pos;
  }
  render(){
    translate(this.pos.x-width/2,this.pos.y-height/2,this.pos.z);
    
    ambientMaterial(color(240,50,50));
    
    for (var i = 0; i < this.num_slots+1; i++) {
      //print("hey");
      push();
      noStroke();  
      box(this._width,this._height,this._depth);
      translate(0, this._height/2-this._depth/2, -this._depth/2 + -this._slot_depth/2);
      if (i != this.num_slots){
        box(this._width,this._depth,this._slot_depth);
        translate(this._width/2-this._depth/2.0,-this._height/2+this._depth/2,0);
        box(this._depth,this._height,this._slot_depth);
        pop();
      } else {
        pop(); 
      }
      translate(0,0,-this._depth+-this._slot_depth);
    }
  }
  /*
  * Gets the vector position of a slot based on a slot number on the rack
  */
  slotpos(slot_num,card){
    var x,y,z;
    var padding = 5;
    x = this.pos.x + width/2 - this._slot_depth/2 - padding - width/2;
    y = this.pos.y + height/2 - card._height/2 - height/2; 
    z = this.pos.z - this._depth/2 - this._slot_depth/2;
    z -= slot_num * 3*(this._depth - this._slot_depth);
    return createVector(x,y,z);
  }
}

/*
* The Deck object defines the appearance of cards
*/
class Deck {
  constructor(_pos,card,topCardNum=13) {
    this.pos = _pos;
    this.numCards = 60;
    this._width = card._width;
    this._depth = card._height;
    this._height = this.numCards*0.3;
    this.topCard = new Card(this.topCardNum=0,createVector(0,-this._height/2-0.1,0),logo_img,back_img,60,rotation=createVector(-PI/2,PI,0))
  }
  
  render(){
    push();
    noStroke();
    translate(this.pos.x,this.pos.y,this.pos.z);
    this.topCard.step_and_render();
    translate(-width/2,-height/2,0);
    texture(_white);
    box(this._width,this._height,this._depth);
    pop();
  }
  /*
  * Creates card with move queue containing path to the target slot
  */
  draw_animation(cardNum,targetSlot,r) { //returns card object
    this.curCard = new Card(this.topCardNum=cardNum,createVector(0,-this._height/2-0.1,0).add(d.pos),logo_img,back_img,60,rotation=createVector(-PI/2,PI,0))

    this.curCard.moves_queue.push(new MoveSet(createVector(0,-80,0).add(d.pos),1,createVector(PI/2,PI,0),easeInOut));
    
    this.curCard.moves_queue.push(new MoveSet(r.slotpos(targetSlot,this.curCard).sub(createVector(200,0,0)),1,createVector(0,0,0),easeInOut));
    
    this.curCard.moves_queue.push(new MoveSet(r.slotpos(targetSlot,this.curCard),1,createVector(0,0,0),easeInOut));
    return this.curCard;
  }
}

/*
* Defines lighting for sketch
*/
function myLights() { 
  //pv = createVector(200*sin(millis()/1000),200,0);
  pv = createVector(-200,200,0);
  pv.normalize();
  directionalLight(255,255,255,pv);
  pv = createVector(200,200,0);
  pv.normalize();
  directionalLight(255,255,255,pv);
  pv = createVector(0,200,0);
  pv.normalize();
  directionalLight(255,255,255,pv);
}