function toggleElement(control, ...targets) {
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
    event.preventDefault();
    const data = {
      notification: document.getElementById('notification').checked,
      notifArrive: document.getElementById('notifArrive').value,
      notifStolen: document.getElementById('notifStolen').value,
      takePicture: document.getElementById('takePicture').checked,
      soundfx: document.getElementById('soundfx').checked,
    };

    try {
      const res = await postJson('/options', data);
      const fileRes = await postFile('/music', 
        document.getElementById('settingsForm'));
      if (res.message === 'success' && fileRes.message === 'success') {
        alert('Saved');
      }
    } catch (err) {
      console.log(err);
    }
  });
}

async function setInitialDashboard() {
  return new Promise(async(resolve, reject) => {
    try {
      const config = await get('/config');
      document.getElementById('mute').checked = config.mute;
      document.getElementById('duration').value = config.muteDuration;
      document.getElementById('allowEntrance').checked = config.allowEntrance;
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
  
}

async function setInitialSettings() {
  return new Promise(async(resolve, reject) => {
    try {
      const config = await get('/config');
      document.getElementById('notification').checked = config.notification;
      document.getElementById('notifArrive').value = config.notifArrive;
      document.getElementById('notifStolen').value = config.notifStolen;
      document.getElementById('takePicture').checked = config.takePicture;
      document.getElementById('soundfx').checked = config.soundfx;
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
  
}

window.addEventListener('load', async(windowEvent) => {
  let resolved;

  if (document.body.id === 'dashboard') {
    addDashboardSubmitEvent();
    resolved = await setInitialDashboard();
  } else if (document.body.id === 'settings') {
    addSettingsSubmitEvent();
    resolved = await setInitialSettings();
  }
  if (resolved) {
    [...document.getElementsByClassName('toggle')].forEach(e => {
      e.onclick();
    });
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

function postFile(url, data) {
  return new Promise(async(resolve, reject) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: new FormData(data)
      });
      resolve(response.json());
    } catch (err) {
      console.log('post err: ' + err.message);
      reject(err);
    }
  });
}
