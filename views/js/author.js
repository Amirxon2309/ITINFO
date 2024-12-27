const div = document.getElementById("cardWrapper");

if (!div) {
  console.error("Element ID 'cardWrapper' topilmadi!");
} else {
  (async function () {
    try {
      const response = await fetch("http://localhost:3030/api/author/all");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP xato: ${response.status}, Ma'lumot: ${errorText}`);
      }

      const data = await response.json();
      console.log("Serverdan olingan ma'lumot:", data);

      if (data.authors && data.authors.length > 0) {
        let htmlContent = ""; // Ma'lumotlarni yig'uvchi o'zgaruvchi
        for (const author of data.authors) {
          htmlContent += `
            <div class="card" style="width: 18rem;">
              <img src="../images/author.jpg" class="card-img-top" alt="Kard bor edi" />
              <div class="card-body">
                <h5 class="card-title">${author.author_first_name} ${author.author_last_name}</h5>
                <p class="card-text">email: ${author.author_email}, phone: ${author.author_phone}</p>
              </div>
            </div>`;
        }
        div.innerHTML = htmlContent; 
      } else {
        console.warn("Avtorlar topilmadi.");
        div.innerHTML = "<p>Hech qanday ma'lumot topilmadi.</p>";
      }
    } catch (error) {
      console.error("Fetch xatolik yuz berdi:", error);
      div.innerHTML = `<p>Xatolik yuz berdi: ${error.message}</p>`;
    }
  })();
}
