function update(conditional, display) {
  let checkbox = document.getElementById(conditional);
  let newDisplay = document.getElementById(display);
  if (checkbox.checked == true) {
    newDisplay.style.display = 'block';
  } else {
    newDisplay.style.display = 'none';
  }
}