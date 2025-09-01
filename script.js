
// ====================================
// BLOOD BANK FRONTEND SCRIPT
// ====================================
document.addEventListener("DOMContentLoaded", () => {
  // ----------------------------
  // DONOR REGISTRATION
  // ----------------------------
  const donorRegisterForm = document.getElementById("donorRegisterForm");
  if (donorRegisterForm) {
    donorRegisterForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(donorRegisterForm);
      const donor = {
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        bloodType: formData.get("bloodType"),
        county: formData.get("county"),
        nationality: formData.get("nationality"),
        password: formData.get("password"),
      };

      try {
        const res = await fetch("http://127.0.0.1:5000/donor/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(donor),
        });

        const data = await res.json();

        if (res.ok) {
          alert("✅ Registration successful! Please login.");
          donorRegisterForm.reset();
          window.location.href = "login.html";
        } else {
          alert("❌ " + (data.error || "Registration failed."));
        }
      } catch (err) {
        console.error("Error:", err);
        alert("⚠️ Could not connect to server.");
      }
    });
  }

  // ----------------------------
  // DONOR LOGIN
  // ----------------------------
  const donorLoginForm = document.getElementById("donorLoginForm");
  if (donorLoginForm) {
    donorLoginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(donorLoginForm);
      const credentials = {
        email: formData.get("email").trim(),
        password: formData.get("password").trim(),
      };

      try {
        const res = await fetch("http://127.0.0.1:5000/donor/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        const data = await res.json();

        if (res.ok) {
          alert(`✅ Welcome back!`);
          localStorage.setItem("donorEmail", credentials.email);
          donorLoginForm.reset();
          window.location.href = "donor-dashboard.html";
        } else {
          alert("❌ " + (data.error || "Invalid login."));
        }
      } catch (err) {
        console.error("Error:", err);
        alert("⚠️ Could not connect to server.");
      }
    });
  }

  // ----------------------------
  // DONOR DASHBOARD
  // ----------------------------
  if (window.location.pathname.includes("donor-dashboard.html")) {
    const donorEmail = localStorage.getItem("donorEmail");
    if (!donorEmail) {
      alert("⚠️ Please login first.");
      window.location.href = "login.html";
    } else {
      const welcomeText = document.querySelector(".hero h1");
      if (welcomeText) {
        welcomeText.textContent = `Welcome Back, ${donorEmail}!`;
      }
      const donationCount = document.getElementById("donation-count");
      if (donationCount) {
        donationCount.textContent = "3"; // Later from DB
      }
    }

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("donorEmail");
        alert("👋 You have been logged out.");
        window.location.href = "index.html";
      });
    }
  }

  // ----------------------------
  // HOSPITAL REGISTRATION
  // ----------------------------
  const hospitalRegisterForm = document.getElementById("hospitalRegisterForm");
  if (hospitalRegisterForm) {
    hospitalRegisterForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(hospitalRegisterForm);
      const hospital = {
        hospitalName: formData.get("hospitalName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        county: formData.get("county"),
        password: formData.get("password"),
      };

      try {
        const res = await fetch("http://127.0.0.1:5000/hospital/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(hospital),
        });

        const data = await res.json();

        if (res.ok) {
          alert("✅ Hospital registered! Please login.");
          hospitalRegisterForm.reset();
          window.location.href = "hospital-login.html";
        } else {
          alert("❌ " + (data.error || "Registration failed."));
        }
      } catch (err) {
        console.error("Error:", err);
        alert("⚠️ Could not connect to server.");
      }
    });
  }

  // ----------------------------
  // HOSPITAL LOGIN
  // ----------------------------
  const hospitalLoginForm = document.getElementById("hospitalLoginForm");
  if (hospitalLoginForm) {
    hospitalLoginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(hospitalLoginForm);
      const credentials = {
        email: formData.get("email").trim(),
        password: formData.get("password").trim(),
      };

      try {
        const res = await fetch("http://127.0.0.1:5000/hospital/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        const data = await res.json();

        if (res.ok) {
          alert(`✅ Welcome, ${data.hospitalName || "Hospital"}!`);
          localStorage.setItem("hospitalEmail", credentials.email);
          hospitalLoginForm.reset();
          window.location.href = "hospital-dashboard.html";
        } else {
          alert("❌ " + (data.error || "Invalid login."));
        }
      } catch (err) {
        console.error("Error:", err);
        alert("⚠️ Could not connect to server.");
      }
    });
  }

  // ----------------------------
  // HOSPITAL DASHBOARD
  // ----------------------------
  if (window.location.pathname.includes("hospital-dashboard.html")) {
    const hospitalEmail = localStorage.getItem("hospitalEmail");
    if (!hospitalEmail) {
      alert("⚠️ Please login first.");
      window.location.href = "hospital-login.html";
    } else {
      const welcomeText = document.querySelector(".hero");
      if (welcomeText) {
        welcomeText.textContent = `Welcome, ${hospitalEmail}!`;
      }
    }

    const logoutBtn = document.getElementById("hospital-logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("hospitalEmail");
        alert("👋 You have been logged out.");
        window.location.href = "index.html";
      });
    }
  }

  // ----------------------------
  // HOSPITAL: FIND DONORS
  // ----------------------------
  const donorSearchForm = document.getElementById("donorSearchForm");
  if (donorSearchForm) {
    donorSearchForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(donorSearchForm);
      const bloodType = formData.get("bloodType");
      const county = formData.get("county").toLowerCase();

      fetch(`http://127.0.0.1:5000/donors/search?bloodType=${bloodType}&county=${county}`)
        .then(res => res.json())
        .then(matches => {
          const resultsDiv = document.getElementById("donorResults");
          if (matches.length > 0) {
            resultsDiv.innerHTML = `
              <h4>✅ Found ${matches.length} donor(s):</h4>
              <ul>
                ${matches.map(d => `
                  <li><strong>${d.fullName}</strong> 
                  (${d.bloodType}, ${d.county}) - 📞 ${d.phone}</li>
                `).join("")}
              </ul>
            `;
          } else {
            resultsDiv.innerHTML = "<p>❌ No matching donors found.</p>";
          }
        })
        .catch(err => {
          console.error("Error:", err);
          alert("⚠️ Could not fetch donor data.");
        });
    });
  }

  // ----------------------------
  // HOSPITAL: CHECK ALL DONORS
  // ----------------------------
  const checkDonorsBtn = document.getElementById("check-donors-btn");
  if (checkDonorsBtn) {
    checkDonorsBtn.addEventListener("click", () => {
      fetch("http://127.0.0.1:5000/donors/all")
        .then(res => res.json())
        .then(donors => {
          const resultsDiv = document.getElementById("donorResults");
          if (donors.length > 0) {
            resultsDiv.innerHTML = `
              <h4>🧾 All Donors (${donors.length}):</h4>
              <ul>
                ${donors.map(d => `
                  <li><strong>${d.fullName}</strong> 
                  (${d.bloodType}, ${d.county}) - 📞 ${d.phone}</li>
                `).join("")}
              </ul>
            `;
          } else {
            resultsDiv.innerHTML = "<p>😕 No donors found in the system.</p>";
          }
        })
        .catch(err => {
          console.error("Error:", err);
          alert("⚠️ Unable to fetch all donors.");
        });
    });
  }
});
