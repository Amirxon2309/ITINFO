const div = document.getElementById("topicWrapper");

(async function () {
  try {
    const response = await fetch("http://localhost:3030/api/topic/all"); 
    if (!response.ok) {
      throw new Error(`HTTP xato: ${response.status}`);
    }

    const data = await response.json();
    console.log(data); 

    for (const topic of data.topics) {
      div.innerHTML += `
        <div class="card" style="width: 18rem;">
        image:<img src="../images/topic.png" class="card-img-top"  alt="Topic rasmi"/>>
          <div class="card-body">
            <h5 class="card-title">${topic.topic_title}</h5>
            <p class="card-text">${topic.topic_description}</p>
          </div>
        </div>`;
    }
  } catch (error) {
    console.error("Xatolik yuzaga keldi", error);
  }
})();
