function update(conditional, display) {
  let checkbox = document.getElementById(conditional);
  let newDisplay = document.getElementById(display);
  if (checkbox.checked) {
    newDisplay.style.display = 'block';
  } else {
    newDisplay.style.display = 'none';
  }
}

//idc about style anymore

// function postForm(event) {

//   const data = {
//     mute: document.getElementById('mute').checked,

//   };
// }

// function post(url, data) {
//   return new Promise(async(resolve, reject) => {
//     try {
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(data)
//       });
//       resolve(response.json());
//     } catch (err) {
//       console.log('post err: ' + err.message);
//       reject(err);
//     }
//   });
// }