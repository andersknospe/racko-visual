/*
* @Author Anders Knospe
* Last Edited: 10/18/2019
*
* Main Loop and Primary Functions
* As with all p5 programs, setup and preload run once, draw runs continuously
*/

function preload() {
  logo_img = loadImage('assets/racko.png'); 
  back_img = loadImage('assets/back_rounded.png'); 
  _red = loadImage('assets/red.jpg');
  _white = loadImage('assets/cardcolor.png');
}

function fillRack(cards, numList, ci, d) { //cards is all cards to render
  let dn;
  if (ci == 0) {
    print(d);
    cards.push(d.draw_animation(numList[ci],0,r)); //int(random(1,61))
    ci+=1; 
  }
  for (let i = 0; i < cards.length; i++){
  	dn = cards[i].step_and_render(); //returns true if still running 
    if ((i+1 == ci) && dn) { // && i < numList.length-1){
      if (i < numList.length-1) { 
        cards.push(d.draw_animation(numList[ci],i+1,r)); 
      }
      ci += 1;
    }
  }
  return ci;
}

var d, r, cards; // d and r are deck and rack respectively
var deck_cards, first_rack_cards, moves;

function setup() {
  createCanvas(600, 400, WEBGL);
  camera(0, -height/2.0, (height/2.0) / tan(PI*30.0 / 180.0), 0, 0, 0, 0, 1, 0);
  cards = [];
  
  template_card = new Card(Math.floor(Math.random() * 61),createVector(100,355,-70),logo_img,back_img,60,rotation=createVector(PI/2,0,0))

  r = new Rack(createVector(400,375,30));
  d = new Deck(createVector(100,375,-70),template_card);
  
  let deck = get_deck();
  let rack_size = 10; 
  
  deck_cards = deck.slice(rack_size);
  first_rack_cards = deck.slice(0,rack_size); // cards on the first rack
  moves = solve(deck,rack_size); // get moves to follow 
  
  smooth();
}

currentStage = "fillRack";
ci = 0; //current or card index;
var anythingRunning; //true if anything is running

function draw() {
  background(200,200,150);
  orbitControl();
  ambientLight(200, 200, 200);
  myLights();
  
  if (currentStage == "fillRack") {
    ci = fillRack(cards,first_rack_cards,ci,d)
    if (ci == first_rack_cards.length+1) {
      currentStage = "play";
      ci = 0;
    }
  } 
  
  if (currentStage == "play") { // going through animation
    if (!anythingRunning) { // if not still running
      cards[moves[ci]] = d.draw_animation(deck_cards[ci],moves[ci],r);
      ci += 1;
    }
    anythingRunning = false;
    for (let i = 0; i < cards.length; i++){
      dn = cards[i].step_and_render(); //returns true if done
      if (!dn) {
        anythingRunning = true;
      }
    }
  }
  
  d.render();
  r.render();
}

function solve(deck,rack_size=6) { //solves with A* Search
  let rack = [];
  let added = 0;
  for (let x = 0; x < rack_size; x++) {
  	rack.push(deck.shift());
  }
  let orig_deck = deck.slice();
  let first = new Node(rack,deck); //starting node
  
  first.priority = 0;
  
  let q = new TinyQueue([], function (a, b) { return a.priority - b.priority; });
  
  q.push(first);
  
  let best_path = [];
  let answer = false;
  let node, n, heur_val;
  
  // main solve loop, finds the best route
  while ((q.data.length != 0) && (answer == false)){
  	node = q.pop();
    if (node.check_win()){
      answer = true;
    } 
    
    for (let i=0; i < node.rack.length; i++){
      n = node.getChildForCardAt(i);
      heur_val = heuracko(n.rack);
      added += 1;
      
      n.priority = heur_val + n.path.length;
      q.push(n);
  	}
  }
  return node.path; // returns fastest route to an ordered rack 
}