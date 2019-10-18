/*
* @Author Anders Knospe
* Last Edited: 10/18/2019
*
* Logic functionality, includes:
* - Node (class) representing states of the game Rack-O
* - Heuracko (func) evaluates the heuristic value of the state
* - Utility functions (isOrdered,get_deck(),scale) 
*/

function isOrdered(arr) {
  let arrayLength = arr.length;
  let last = arr[0]
  for (var i = 0; i < arrayLength; i++) {
    if (last > arr[i]) {
      return false;
    } else {
      last = arr[i];
    }
  }

  return true;
}

/*
* Node (state) of Rack-O game
*/
class Node {
  constructor(rack, deck, path = []) {
    this.priority = 0
    this.rack = rack
    this.deck = deck
    this.path = path
  }
  
  // get child if a card was placed at an index
  getChildForCardAt(replace_index) {
    //don't replace at an index (i.e. discard)
    let r, d;
    //var path_var = String(this.deck[0]) + "_at_" + String(replace_index);
    let path_var = replace_index;

    if (replace_index == "None") {
      r = this.rack.slice();
      d = this.deck.slice(1, this.deck.length);
      return (new Node(r, d, [].concat(this.path, path_var))); //change final path parameter
      // was [r];
    } else {
      r = this.rack.slice(); // copy rack
      r[replace_index] = this.deck[0] // put card in rack
      d = this.deck.slice(1, this.deck.length); //copy and draw from deck
      return (new Node(r, d, [].concat(this.path, path_var)));
      // was [r];
    }
  }

  check_win() {
    if (isOrdered(this.rack)) {
      return true;
    } else {
      return false;
    }
  }
}

/*
 * Returns shuffled input array
 */
function shuffle(array) {
  let i = 0,
    j = 0,
    temp = null;

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

/*
 * Evaluates rack by heuristic, minimum value is best rack
 * Heuristic is the length of the rack minus the maximum number of ordered cards
 */
function heuracko(rack, i = 0, inc_lst = []) {
  if (!isOrdered(inc_lst)) { // included list of
    return rack.length + 10; // never minimum
  } else if (i == rack.length) { // reached end of the rack
    return rack.length - inc_lst.length
  } else {
    //minimum of including and not including the current card
    return Math.min(heuracko(rack, i + 1, inc_lst.concat(rack[i])),
      heuracko(rack, i + 1, inc_lst))
  }
}

/*
 * Generates base deck (array), shuffled
 */
function get_deck() {
  let d = []
  for (i = 0; i < 61; i++) {
    d.push(i);
  }
  d = shuffle(d);
  return d;
}

/*
 * Scales number between in_min and in_max to between out_min and out_max
 */
const scale = (num, in_min, in_max, out_min, out_max) => {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}