function update() {
  let muteCheckbox = document.getElementById("mute");
  let muteOptions = document.getElementById("mute-options");
  if (muteCheckbox.checked == true) {
    muteOptions.style.display = 'block';
  } else {
    muteOptions.style.display = 'none';
  }
}