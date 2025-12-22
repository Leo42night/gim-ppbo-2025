(() => {
  const { S } = window.GAME;
  const { isLoggedIn } = window.AUTH;

  let projects = [
    {
      title: "SIBUTAD",
      image: `${S.BASE_URL}/img/kel-1.png`,
    },
    {
      title: "Hotel 48",
      image: `${S.BASE_URL}/img/kel-2.png`,
    },
    {
      title: "Roona",
      image: `${S.BASE_URL}/img/kel-3.png`,
    },
    {
      title: "SIP Hewan",
      image: `${S.BASE_URL}/img/kel-4.png`,
    },
    {
      title: "SIGUDA",
      image: `${S.BASE_URL}/img/kel-5.png`,
    }
  ];

  async function fetchRatings() {
    const res = await fetch(`${S.BASE_URL}/api/ratings`, { method: "GET" });
    const data = await res.json(); // urutan array sama dengan projects

    // console.log(data);

    const projectNew = [];
    for (let i = 0; i < projects.length; i++) {
      const newrating = {
        5: { count: 0, users: [] },
        4: { count: 0, users: [] },
        3: { count: 0, users: [] },
        2: { count: 0, users: [] },
        1: { count: 0, users: [] }
      };
      for (const rating of Object.values(JSON.parse(data[i].ratings))) {
        // console.log(rating);
        if (!rating.rate) continue;
        newrating[rating.rate].count = rating.count;
        newrating[rating.rate].users = rating.avatars;
      }
      // console.log(newrating);

      projectNew.push({
        title: projects[i].title,
        image: projects[i].image,
        ratings: newrating
      });
    }

    // console.log(projectNew);

    projects = projectNew;
  }
  // fetchRatings();

  function calculateAverage(ratings) {
    let totalScore = 0;
    let totalUser = 0;

    Object.entries(ratings).forEach(([rate, data]) => {
      totalScore += rate * data.count;
      totalUser += data.count;
    });

    if (totalUser === 0) return { avg: 0, totalUser };

    return {
      avg: (totalScore / totalUser).toFixed(1),
      totalUser
    };
  }

  function stars(avg) {
    const full = Math.floor(avg);
    return "★".repeat(full) + "☆".repeat(5 - full);
  }

  function updateRating() {
    if (!isLoggedIn) {
      S.popupRatingContainerEl.innerHTML = `<p>Silakan berikan rating terlebih dahulu</p>`;
    } else {
      projects.forEach(project => {
        const result = calculateAverage(project.ratings);

        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
        <img class="project-img" src="${project.image}">
        <div class="card-body">
          <div class="card-title">${project.title}</div>
    
          <div class="rating-average">
            <span class="stars">${stars(result.avg)}</span> (${result.avg})
          </div>
    
          ${Object.entries(project.ratings)
            .sort((a, b) => b[0] - a[0])
            .map(([rate, data]) => `
            <div class="rating-row">
              <div class="rating-header">
                <div class="rating-info">
                  <span>${rate} ★</span>
                  <span class="rating-count">(${data.count} orang)</span>
                </div>
              </div>
              <div class="avatars">
                ${data.users.map(u => `<img src="${u}" title="User">`).join("")}
              </div>
            </div>
          `).join("")}
    
          <div class="total">Total Penilai: ${result.totalUser}</div>
        </div>
      `;

        S.popupRatingContainerEl.appendChild(card);
      });
    }
  }

  window.RATING = {
    fetchRatings,
    updateRating
  };
})();