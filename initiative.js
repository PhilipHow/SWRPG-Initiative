var slots;
var round;
var current_slot;
var disabled;

var success;
var advantage;
var triumph;

// reset dice results
function clear_slot() {
  success = 0;
  advantage = 0;
  triumph = 0;

  // update displayed dice results
  document.getElementById('success_counter').innerHTML = success;
  document.getElementById('advantage_counter').innerHTML = advantage;
  document.getElementById('triumph_counter').innerHTML = triumph;
}

// reset the entire app
function reset() {
  slots = [];
  round = 0;
  current_slot = 0;
  disabled = 0;
  clear_slot();
  redrawTable();

  // update round countets, and hide buttons
  document.getElementById('round_counter').innerHTML = "";
  document.getElementById('next_button').className = "hidden";
  document.getElementById('reset_button').className = "hidden";
}

function addSuccess() {
  success++;
  document.getElementById('success_counter').innerHTML = success;
}

function addAdvantage() {
  advantage++;
  document.getElementById('advantage_counter').innerHTML = advantage;
}

function addTriumph() {
  triumph++;
  document.getElementById('triumph_counter').innerHTML = triumph;
}

function addSlot() {
  var player = "";

  if (document.getElementById('player_radio').checked === true) {
    player = "Player";
  } else {
    player = "GM";
  }

  var newSlot = {
    player : player,
    success: success,
    advantage: advantage,
    triumph: triumph,
    status: true
  }

  if (slots.length === 0) {
    slots.push(newSlot);
    // unhide next button
    document.getElementById('next_button').className = "";
    document.getElementById('reset_button').className = "";
  } else {
    // traverse existing slots (already ordered) to determine slot
    var length = slots.length;

      for (var i = 0; i <= length; i++) {
        if (i == length) {
          // reached the end of the list- append to the end
          slots.push(newSlot);
        } else {

        if (newSlot.success > slots[i].success) {
          // higher successes
          slots.splice(i,0,newSlot);
          if (i+1 <= current_slot) {
            current_slot++;
          }
          break;

        } else if (newSlot.success === slots[i].success) {
          // equal successes
          if (newSlot.advantage > slots[i].advantage) {
            // higher advantages
            slots.splice(i,0,newSlot);
            if (i+1 <= current_slot) {
              current_slot++;
            }
            break;
          } else if (newSlot.advantage === slots[i].advantage) {
            // equal advantages
            if (newSlot.triumph > slots[i].triumph) {
              // higher triumphs
              slots.splice(i,0,newSlot);
              if (i+1 <= current_slot) {
                current_slot++;
              }
              break;
            } else if (newSlot.triumph === slots[i].triumph) {
              // equal triumphs

              // player breaks ties
              if (newSlot.player == "Player") {
                slots.splice(i,0,newSlot);
                if (i+1 <= current_slot) {
                  current_slot++;
                }
                break;
              }
            }
          }
          // lower advantages (carry on going)
        }
        // lower successes(carry on going)
      }
    }
  }

  clear_slot();
  redrawTable();
}

// if not started, delete the slot, if started toggle the slot
function removeSlot(row) {

  var slot_remove = row.id.substr(5);

  if (round === 0) {
    
    slots.splice(slot_remove-1,1);

    if (current_slot > slot_remove) {
      current_slot--;
    }

    // hide buttons if no more slots
    if (slots.length === 0) {
      document.getElementById('next_button').className = "hidden";
      document.getElementById('reset_button').className = "hidden";
    }
    
  } else {
    slots[slot_remove-1].status = false;
    disabled++;

    if (disabled === slots.length) {
      document.getElementById('next_button').disabled = true;
    }
  }
  redrawTable();
}

// untoggle a slot
function restoreSlot(row) {
  var slot_restore = row.id.substr(5);

  slots[slot_restore-1].status = true;
  disabled--;

  if (disabled < slots.length) {
    document.getElementById('next_button').disabled = false;
  }
  redrawTable();
}

function redrawTable() {
  
  var new_table = "";
  var slot_number = 1;

  for (slot of slots) {

    if (current_slot === slot_number) {
      var new_row = "<tr class='highlight'>";
    } else if (!slot.status) {
      var new_row = "<tr class='disabled'>";
    } else {
      var new_row = "<tr>";
    }

    new_row += "<td>" + slot_number + "</td><td>" + slot.player + "</td><td>" + slot.success +
    "</td><td>" + slot.advantage + "</td><td>" + slot.triumph + "</td>";

    new_row += "<td><button class='tick' id='slot_" + slot_number + "' onclick="

    if (slot.status) {
      new_row += "removeSlot(this)>×</button></td>";
    } else {
      new_row +="restoreSlot(this)>✓</button></td>";
    }

   
    new_row += "</tr>";

    slot_number++;
    new_table += new_row;
  }

  document.getElementById('table_rows').innerHTML = new_table;
}

function next() {

  if (slots.length === 0) {
    return false;
  }

  var set = false;

  if (round === 0) {
    document.getElementById('next_button').innerHTML = "Next";

    for (var i = 0; i < slots.length; i++) {
      if (slots[i].triumph > 0) {
        round = "Pre";
        current_slot = i + 1;
        set = true;
        break;
      }
    }

    if (!set) {
      round = 1;
    }
  }

  if (!set) {
    if (round === "Pre") {
      for (var i = current_slot; i < slots.length; i++) {
        if (slots[i].triumph > 0) {
          current_slot = i + 1;
          set = true;
          break;
        }
      }

      if (!set) {
        round = 1;
        current_slot = 0;
      }
    }
  }

  if (!set) {
    current_slot++;

    if (current_slot > slots.length) {
      round++;
      current_slot = 1;
    }
  }

  // not a great way of doing this..
  while (!slots[current_slot-1].status) {
    next();
  }

  document.getElementById('round_counter').innerHTML = "Round: " + round;
  redrawTable();
}
