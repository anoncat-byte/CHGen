const HIGHLIGHTS_KEY = "little-lights-highlights";
const LOCATION_KEY = "little-lights-location";
const SESSION_KEY = "little-lights-session";
const TASKS_KEY = "little-lights-tasks";
const TEAM_KEY = "little-lights-team";

const defaultHighlights = [
  {
    title: "Bible stories brought to life",
    detail: "Hands-on conversations help teens connect scripture with everyday choices.",
  },
  {
    title: "A place for every family",
    detail: "Warm check-in and familiar faces help new families feel at home.",
  },
  {
    title: "Faith beyond Sunday",
    detail: "Seasonal service projects invite teens to care for their neighbors.",
  },
];

const defaultLocation = {
  name: "Main church campus",
  detail: "Youth ministry meets in the community room. Ask at the welcome desk.",
  address: "Church address to be added",
};

const defaultTeam = [
  {
    name: "Maya Thompson",
    role: "Ministry Director",
    responsibility: "Plans weekly gatherings and partners with families as teens grow in faith.",
  },
  {
    name: "Caleb Brooks",
    role: "Volunteer Coordinator",
    responsibility: "Schedules volunteers and prepares materials for Sunday gatherings.",
  },
  {
    name: "Sofia Ramirez",
    role: "Family Welcome Lead",
    responsibility: "Welcomes visiting families and helps make check-in easy.",
  },
];

const demoAccounts = {
  "admin@demo.org": { password: "GrowTogether26!", name: "Ministry Admin", role: "Admin" },
  "moderator@demo.org": { password: "GrowTogether26!", name: "Team Moderator", role: "Moderator" },
};

function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveStored(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function currentHighlights() {
  const highlights = readStored(HIGHLIGHTS_KEY, defaultHighlights);
  let changed = false;
  const migrated = highlights.map((item) => {
    const replacements = {
      "Hands-on lessons help children connect scripture with everyday choices.": "Hands-on conversations help teens connect scripture with everyday choices.",
      "Seasonal service moments invite children to care for their neighbors.": "Seasonal service projects invite teens to care for their neighbors.",
    };
    if (!replacements[item.detail]) {
      return item;
    }
    changed = true;
    return { ...item, detail: replacements[item.detail] };
  });
  if (changed) {
    saveStored(HIGHLIGHTS_KEY, migrated);
  }
  return migrated;
}

function currentLocation() {
  const location = readStored(LOCATION_KEY, defaultLocation);
  if (location.detail === "Children's ministry check-in is at the welcome desk.") {
    const migrated = { ...location, detail: defaultLocation.detail };
    saveStored(LOCATION_KEY, migrated);
    return migrated;
  }
  return location;
}

function currentTeam() {
  const team = readStored(TEAM_KEY, defaultTeam);
  let changed = false;
  const migrated = team.map((person) => {
    if (person.responsibility !== "Plans weekly lessons and partners with families as children grow in faith.") {
      return person;
    }
    changed = true;
    return { ...person, responsibility: defaultTeam[0].responsibility };
  });
  if (changed) {
    saveStored(TEAM_KEY, migrated);
  }
  return migrated;
}

function renderPublicContent() {
  const highlightContainer = document.querySelector("#public-highlights");
  highlightContainer.innerHTML = currentHighlights().map((item, index) => `
    <article class="highlight-card">
      <span class="highlight-number">0${index + 1} / MINISTRY MOMENT</span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.detail)}</p>
    </article>
  `).join("");

  const location = currentLocation();
  document.querySelector("#public-location-name").textContent = location.name;
  document.querySelector("#public-location-detail").textContent = location.detail;
  document.querySelector("#public-location-address").textContent = location.address;

  document.querySelector("#public-team-list").innerHTML = currentTeam().map((person, index) => `
    <article class="team-row">
      <span class="team-index">${String(index + 1).padStart(2, "0")}</span>
      <div><h3>${escapeHtml(person.name)}</h3><p><strong>${escapeHtml(person.role)}</strong><br>${escapeHtml(person.responsibility)}</p></div>
      <span class="team-symbol" aria-hidden="true">✳</span>
    </article>
  `).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function showView(view) {
  document.querySelector("#public-view").hidden = view !== "public";
  document.querySelector("#login-view").hidden = view !== "login";
  document.querySelector("#dashboard-view").hidden = view !== "dashboard";
  window.scrollTo(0, 0);
}

function renderDashboard(account, activeTab = "overview") {
  const isAdmin = account.role === "Admin";
  document.querySelectorAll("[data-dashboard-tab]").forEach((button) => {
    const isActive = button.dataset.dashboardTab === activeTab;
    button.classList.toggle("sidebar-active", isActive);
    if (isActive) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
  document.querySelector("#user-name").textContent = account.name;
  document.querySelector("#user-role").textContent = account.role;
  document.querySelector("#user-avatar").textContent = account.name.slice(0, 1);

  const dashboard = document.querySelector("#dashboard-content");
  if (activeTab === "team") {
    renderTeamDashboard(account, dashboard);
    return;
  }

  if (!isAdmin) {
    const tasks = readStored(TASKS_KEY, [false, false, false]);
    dashboard.innerHTML = `
      <p class="eyebrow"><span></span> SUNDAY TEAM</p>
      <h1>Good to have you here.</h1>
      <p class="dashboard-lede">A few ways to help this week's gathering feel thoughtful and welcoming.</p>
      <div class="dashboard-stats">
        <article class="stat-card"><span>YOUR ROLE</span><strong>Moderator</strong></article>
        <article class="stat-card"><span>TEAM CHECKLIST</span><strong>${tasks.filter(Boolean).length} / ${tasks.length}</strong></article>
        <article class="stat-card"><span>NEXT GATHERING</span><strong>Sunday</strong></article>
      </div>
      <div class="dashboard-grid">
        <section class="dashboard-panel"><h2>Team checklist</h2><p>Keep the small details in view as you prepare.</p>
          <ul class="task-list">
            <li><input id="task-0" type="checkbox" ${tasks[0] ? "checked" : ""}><label for="task-0" class="${tasks[0] ? "task-complete" : ""}">Welcome and check-in area ready<span>Set out name tags and family check-in materials.</span></label></li>
            <li><input id="task-1" type="checkbox" ${tasks[1] ? "checked" : ""}><label for="task-1" class="${tasks[1] ? "task-complete" : ""}">Lesson room prepared<span>Check the activity supplies and room setup.</span></label></li>
            <li><input id="task-2" type="checkbox" ${tasks[2] ? "checked" : ""}><label for="task-2" class="${tasks[2] ? "task-complete" : ""}">Follow up with families<span>Share a warm hello with visiting families.</span></label></li>
          </ul>
        </section>
        <section class="dashboard-panel"><h2>For this week</h2><p><strong>Gathering:</strong> Sunday morning</p><p><strong>Focus:</strong> Make room for questions, kindness, and connection.</p><p>Your checklist is saved in this browser.</p></section>
      </div>`;
    dashboard.querySelectorAll(".task-list input").forEach((input) => {
      input.addEventListener("change", () => {
        const updated = [...dashboard.querySelectorAll(".task-list input")].map((item) => item.checked);
        saveStored(TASKS_KEY, updated);
        renderDashboard(account);
      });
    });
    return;
  }

  const highlights = currentHighlights();
  const location = currentLocation();
  dashboard.innerHTML = `
    <p class="eyebrow"><span></span> MINISTRY OVERVIEW</p>
    <h1>Welcome, ${escapeHtml(account.name.split(" ")[0])}.</h1>
    <p class="dashboard-lede">A quick look at the public ministry portal and your team workspace.</p>
    <div class="dashboard-stats">
      <article class="stat-card"><span>PUBLIC HIGHLIGHTS</span><strong>${highlights.length}</strong></article>
      <article class="stat-card"><span>TEAM MEMBERS</span><strong>${currentTeam().length}</strong></article>
      <article class="stat-card"><span>LOCATION</span><strong>${location.address === "Church address to be added" ? "To add" : "Set"}</strong></article>
    </div>
    <div class="dashboard-grid">
      <section class="dashboard-panel"><h2>Ministry highlights</h2><ul class="managed-list">${highlights.map((item, index) => `
        <li class="managed-item"><div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.detail)}</p></div><button class="text-button" type="button" data-remove="${index}" aria-label="Remove ${escapeHtml(item.title)}">Remove</button></li>`).join("")}
      </ul>
      <form class="admin-form" id="highlight-form">
        <label for="highlight-title">Add a highlight</label><input id="highlight-title" name="title" maxlength="70" placeholder="A moment worth celebrating" required>
        <label for="highlight-detail">Short description</label><textarea id="highlight-detail" name="detail" maxlength="180" placeholder="Share what your ministry is growing." required></textarea>
        <button class="button button-ink button-small" type="submit">Publish highlight <span aria-hidden="true">→</span></button>
      </form></section>
      <section class="dashboard-panel"><h2>Team and location</h2><p>Keep the public visit details current for families.</p>
        <div class="team-role-list">${currentTeam().map((person) => `<p><strong>${escapeHtml(person.name)}</strong><br>${escapeHtml(person.role)}</p>`).join("")}</div>
        <form class="admin-form location-form" id="location-form">
          <h3>Visit details</h3>
          <label for="location-name">Campus or church name</label><input id="location-name" name="name" maxlength="70" value="${escapeHtml(location.name)}" required>
          <label for="location-detail">Check-in information</label><input id="location-detail" name="detail" maxlength="120" value="${escapeHtml(location.detail)}" required>
          <label for="location-address">Address</label><input id="location-address" name="address" maxlength="120" value="${escapeHtml(location.address)}" required>
          <button class="button button-ink button-small" type="submit">Save location <span aria-hidden="true">→</span></button>
        </form>
      </section>
    </div>`;

  dashboard.querySelector("#highlight-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextHighlights = [...currentHighlights(), {
      title: formData.get("title").trim(),
      detail: formData.get("detail").trim(),
    }];
    saveStored(HIGHLIGHTS_KEY, nextHighlights);
    renderPublicContent();
    renderDashboard(account);
  });
  dashboard.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextHighlights = currentHighlights().filter((_, index) => index !== Number(button.dataset.remove));
      saveStored(HIGHLIGHTS_KEY, nextHighlights);
      renderPublicContent();
      renderDashboard(account);
    });
  });
  dashboard.querySelector("#location-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    saveStored(LOCATION_KEY, {
      name: formData.get("name").trim(),
      detail: formData.get("detail").trim(),
      address: formData.get("address").trim(),
    });
    renderPublicContent();
    renderDashboard(account);
  });
}

function renderTeamDashboard(account, dashboard) {
  const team = currentTeam();
  dashboard.innerHTML = `
    <p class="eyebrow"><span></span> SUNDAY TEAM</p>
    <h1>Meet the people who make it happen.</h1>
    <p class="dashboard-lede">See who's serving and the care they bring to the ministry. New team members appear on the public ministry page too.</p>
    <div class="team-dashboard-layout">
      <section class="dashboard-panel team-roster-panel">
        <div class="team-roster-heading"><div><h2>Ministry team</h2><p>${team.length} ${team.length === 1 ? "person" : "people"} serving</p></div><span class="sample-badge">SAMPLE ROSTER</span></div>
        <ul class="roster-list">${team.length ? team.map((person, index) => `
          <li class="roster-item">
            <span class="roster-avatar">${escapeHtml(person.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase())}</span>
            <div class="roster-copy"><h3>${escapeHtml(person.name)}</h3><strong>${escapeHtml(person.role)}</strong><p>${escapeHtml(person.responsibility)}</p></div>
            <button class="text-button" type="button" data-remove-person="${index}" aria-label="Remove ${escapeHtml(person.name)}">Remove</button>
          </li>`).join("") : `<li class="roster-empty">No team members yet. Add the first person using the form.</li>`}
        </ul>
      </section>
      <section class="dashboard-panel add-person-panel">
        <p class="eyebrow"><span></span> GROW THE TEAM</p>
        <h2>Add a person</h2>
        <p>Share a name and the part they play in the ministry.</p>
        <form class="admin-form" id="team-person-form">
          <label for="person-name">Name</label><input id="person-name" name="name" maxlength="70" placeholder="First and last name" required>
          <label for="person-role">Role</label><input id="person-role" name="role" maxlength="70" placeholder="For example, Sunday teacher" required>
          <label for="person-responsibility">Responsibilities</label><textarea id="person-responsibility" name="responsibility" maxlength="180" placeholder="What do they help with?" required></textarea>
          <button class="button button-ink button-small" type="submit">Add to ministry team <span aria-hidden="true">→</span></button>
        </form>
        <p class="sample-warning">These sample names are for demonstration. Replace them before sharing the site publicly.</p>
      </section>
    </div>`;

  dashboard.querySelector("#team-person-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextTeam = [...currentTeam(), {
      name: formData.get("name").trim(),
      role: formData.get("role").trim(),
      responsibility: formData.get("responsibility").trim(),
    }];
    saveStored(TEAM_KEY, nextTeam);
    renderPublicContent();
    renderDashboard(account, "team");
  });

  dashboard.querySelectorAll("[data-remove-person]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTeam = currentTeam().filter((_, index) => index !== Number(button.dataset.removePerson));
      saveStored(TEAM_KEY, nextTeam);
      renderPublicContent();
      renderDashboard(account, "team");
    });
  });
}

function openDashboard(account) {
  renderDashboard(account);
  showView("dashboard");
}

document.querySelector("#open-login").addEventListener("click", () => {
  document.querySelector("#login-form").reset();
  document.querySelector("#login-error").hidden = true;
  showView("login");
});

document.querySelector("#back-to-site").addEventListener("click", () => showView("public"));
document.querySelector("#dashboard-home").addEventListener("click", (event) => {
  event.preventDefault();
  openDashboard(JSON.parse(sessionStorage.getItem(SESSION_KEY)));
});
document.querySelectorAll("[data-dashboard-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    const account = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    if (account) {
      renderDashboard(account, button.dataset.dashboardTab);
    }
  });
});
document.querySelector("#return-public").addEventListener("click", (event) => {
  event.preventDefault();
  showView("public");
});
document.querySelector("#sign-out").addEventListener("click", () => {
  sessionStorage.removeItem(SESSION_KEY);
  showView("public");
});
document.querySelector("#login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const email = String(formData.get("email")).trim().toLowerCase();
  const account = demoAccounts[email];
  if (!account || account.password !== formData.get("password")) {
    document.querySelector("#login-error").hidden = false;
    return;
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ name: account.name, role: account.role }));
  event.currentTarget.reset();
  openDashboard({ name: account.name, role: account.role });
});

renderPublicContent();
const existingSession = sessionStorage.getItem(SESSION_KEY);
if (existingSession) {
  try {
    openDashboard(JSON.parse(existingSession));
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    showView("public");
  }
} else {
  showView("public");
}