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
      const res = await post('/options', data);
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
      soundfx: document.getElementById('soundfx').checked,
      soundPath: document.getElementById('sound').value
    };

    try {
      const res = await post('/options', data);
      if (res.message === 'success') {
        alert('Saved');
      }
    } catch (err) {
      console.log(err);
    }
  });
}

window.addEventListener('DOMContentLoaded', (windowEvent) => {
  if (document.body.id === 'dashboard') {
    addDashboardSubmitEvent();
  } else if (document.body.id === 'settings') {
    addSettingsSubmitEvent();
  }
});


function post(url, data) {
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