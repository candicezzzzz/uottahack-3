function hideElement(control, ...targets) {
  const checkbox = document.getElementById(control);
  let options = targets.map(id => document.getElementById(id));

  if (checkbox.checked) {
    options.forEach(option => option.style.display = 'block');
  } else {
    options.forEach(option => option.style.display = 'none');
  }
}

function addDashboardSubmitEvent() {
  document.getElementById('dashboardForm')
          .addEventListener('submit', async(event) => {
    event.preventDefault();
    const data = {
      mute: document.getElementById('mute').checked,
      muteDuration: Number(document.getElementById('duration').value),
      allowEntrance: document.getElementById('allowEntrance').checked
    };

    try {
      const res = await postJson('/options', data);
      if (res.message === 'success') {
        alert('Saved');
      }
    } catch (err) {
      console.log(err);
    }
  });
}

function addSettingsSubmitEvent() {
  document.getElementById('settingsForm')
          .addEventListener('submit', async(event) => {
    // event.preventDefault();
    const data = {
      notification: document.getElementById('notification').checked,
      notifArrive: document.getElementById('notifArrive').value,
      notifStolen: document.getElementById('notifStolen').value,
      takePicture: document.getElementById('takePicture').checked,
      soundfx: document.getElementById('soundfx').checked,
      soundPath: document.getElementById('soundPath').files[0].name
    };

    // console.log(document.getElementById('soundPath').files);

    try {
      const res = await postJson('/options', data);
      if (res.message === 'success') {
        alert('Saved');
        // event.preventDefault();
      }
    } catch (err) {
      console.log(err);
    }
  });
}

async function setInitialDashboard() {
  try {
    const config = await get('/config');
    console.log(config);
    document.getElementById('mute').checked = config.mute;
    document.getElementById('duration').value = config.muteDuration;
    document.getElementById('allowEntrance').checked = config.allowEntrance;
  } catch (err) {
    console.log(err);
  }
}

async function setInitialSettings() {
  try {
    const config = await get('/config');
    document.getElementById('notification').checked = config.notification;
    document.getElementById('notifArrive').value = config.notifArrive;
    document.getElementById('notifStolen').value = config.notifStolen;
    document.getElementById('takePicture').checked = config.takePicture;
    document.getElementById('soundfx').checked = config.soundfx;
    // document.getElementById('soundPath').value = config.soundPath;
  } catch (err) {
    console.log(err.message);
  }
}

window.addEventListener('load', (windowEvent) => {
  if (document.body.id === 'dashboard') {
    addDashboardSubmitEvent();
    setInitialDashboard();
  } else if (document.body.id === 'settings') {
    addSettingsSubmitEvent();
    setInitialSettings();
  }
});

function get(url) {
  return new Promise(async(resolve, reject) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      resolve(response.json());
    } catch (err) {
      reject(err);
    }
  });
}

function postJson(url, data) {
  return new Promise(async(resolve, reject) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      resolve(response.json());
    } catch (err) {
      console.log('post err: ' + err.message);
      reject(err);
    }
  });
}

// function postFile(url, data) {
//   return new Promise(async(resolve, reject) => {
//     try {
//       const formData = new FormData();
//       for (const name in data) {
//         formData.append(name, data[name]);
//       }

//       const response = await fetch(url, {
//         method: 'POST',
//         body: formData
//       });
//       resolve(response.json());
//     } catch (err) {
//       console.log('post err: ' + err.message);
//       reject(err);
//     }
//   });
// }
