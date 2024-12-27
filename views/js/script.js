async function getAuthors() {
  let accessToken = localStorage.getItem("accessToken");
  console.log("accessToken", { accessToken });

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

  try {
    const response = await fetch("http://localhost:3030/api/author/all", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      mode: "cors",
    });

    if (response.ok) {
      const author = await response.json();
      console.log(author.authors);
      displayAuthor(author.authors);
    } else {
      console.log("Request failed with status: " + response.status);
    }
  } catch (error) {
    console.error("Error", error);
  }
}

function displayAuthor(authors) {
  const authorcards = document.getElementById("cardWrapper");
  authorcards.innerHTML = ""; // Eski ma'lumotlarni tozalash
  authors.forEach((author) => {
    authorcards.innerHTML += `
      <div class="card" style="width: 18rem;">
        <img src="../images/author.jpg" class="card-img-top" alt="RASM" />
        <div class="card-body">
          <h5 class="card-title">${author.author_first_name} ${author.author_last_name}</h5>
          <p class="card-text">email: ${author.author_email} <br> phone: ${author.author_phone}</p>
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

async function refreshTokenFunc() {
  try {
    const response = await fetch("http://localhost:3030/api/author/refresh", {
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

    localStorage.setItem("accessToken", data.accessToken); // Yangi tokenni saqlash
    return data.accessToken;
  } catch (error) {
    console.error("RefreshToken xatolik:", error);
    window.location.replace("/login"); // Xato bo'lsa, login sahifasiga qaytarish
    return null;
  }
}
