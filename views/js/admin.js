async function getAdmins() {
  let accessToken = localStorage.getItem("Admin_accessToken");
  console.log("Admin_accessToken", { accessToken });

  const accessTokenExpTime = getTokenExpiration(accessToken);
  console.log("accessTokenExpTime", accessTokenExpTime);

  if (accessTokenExpTime) {
    const currentTime = new Date();
    if (currentTime < accessTokenExpTime) {
      console.log("accessToken faol");
    } else {
      console.log("accessToken vaqti tugagan");
      accessToken = await refreshTokenFunc(); // Yangi token qaytariladi
    }
  }

  if (!isCreator(accessToken)) {
    console.log("Sizda bu ma'lumotlarni ko'rish huquqi yo'q");
    alert("Sizda bu ma'lumotlarni ko'rish huquqi yo'q");
    return; // Agar `creator` bo'lmasa, funksiyani tugatish
  }

  try {
    const response = await fetch("http://localhost:3030/api/admin/all", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      mode: "cors",
    });

    if (response.ok) {
      const admin = await response.json();
      console.log(admin.admins);
      displayAdmin(admin.admins); // Adminlarni ko'rsatish uchun chaqiriladi
    } else {
      console.log("Request failed with status: " + response.status);
    }
  } catch (error) {
    console.error("Error", error);
  }
}

function displayAdmin(admins) {
  const admincards = document.getElementById("cardWrapper");
  admincards.innerHTML = ""; // Eski ma'lumotlarni tozalash
  admins.forEach((admin) => {
    admincards.innerHTML += `
      <div class="card" style="width: 18rem;">
        <img src="../images/admin.png" class="card-img-top" alt="Admin rasmi bor " />
        <div class="card-body">
          <h5 class="card-title">${admin.admin_name} </h5>
          <p class="card-text">email: ${admin.admin_email} <br> phone: ${admin.admin_phone}</p>
        </div>
      </div>`;
  });
}

function getTokenExpiration(token) {
  if (!token) return null; // Token bo'lmasa, null qaytaring
  try {
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    if (decodedToken.exp) {
      return new Date(decodedToken.exp * 1000);
    }
  } catch (error) {
    console.error("Tokenni dekodlashda xatolik:", error);
  }
  return null;
}

function isCreator(token) {
  if (!token) {
    console.error("Token mavjud emas");
    return false;
  }

  try {
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    return decodedToken.admin_is_creator === true; // Faqat `creator` adminlar uchun `true` qaytaradi
  } catch (error) {
    console.error("Tokenni dekodlashda xatolik:", error);
    return false;
  }
}

async function refreshTokenFunc() {
  try {
    const response = await fetch("http://localhost:3030/api/admin/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (data.error && data.error === "jwt expired") {
      console.log("Refresh token ham vaqti tugagan");
      window.location.replace("/login"); // Login sahifasiga qaytarish
      return null;
    }

    localStorage.setItem("Admin_accessToken", data.accessToken); // Yangi tokenni saqlash
    return data.accessToken;
  } catch (error) {
    console.error("RefreshToken xatolik:", error);
    window.location.replace("/login"); // Xato bo'lsa, login sahifasiga qaytarish
    return null;
  }
}
