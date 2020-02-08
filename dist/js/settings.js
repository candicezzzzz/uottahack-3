function update(conditional, display) {
  let checkbox = document.getElementById(conditional);
  let newDisplay = document.getElementById(display);
  if (checkbox.checked == true) {
    newDisplay.style.display = 'block';
  } else {
    newDisplay.style.display = 'none';
  }
}

function splitter(conditional, display1, display2) {
  update(conditional, display1);
  update(conditional, display2);
}