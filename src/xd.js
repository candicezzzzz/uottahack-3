function update() {
  if (document.getElementById("mute").selected == false) {
    document.getElementById("mute-options").style.display = "none";
  } else {
    document.getElementById("mute-options").style.display = "block";
  }
}