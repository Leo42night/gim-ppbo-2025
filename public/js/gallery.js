function showGallery() {
  const bgOverlay = document.getElementById('background-overlay');
  const gallery = document.getElementById('gallery');
  const closeBtn = document.getElementById('closeBtn');
  const cards = document.querySelectorAll('.photo-card');
  const textArea = document.querySelector('.text-area');

  bgOverlay.classList.add('active');
  gallery.classList.add('active');
  closeBtn.classList.add('active');

  setTimeout(() => {
    cards.forEach(card => {
      card.classList.add('slide-in');
    });
    textArea.classList.add('slide-in');
  }, 100);
}

function focusPhoto(element) {
  const cards = document.querySelectorAll('.photo-card');

  // Remove active dari semua card
  cards.forEach(card => {
    card.classList.remove('active');
  });

  // Tambahkan active ke card yang diklik
  element.classList.add('active');
}

function closeGallery() {
  const bgOverlay = document.getElementById('background-overlay');
  const gallery = document.getElementById('gallery');
  const closeBtn = document.getElementById('closeBtn');
  const cards = document.querySelectorAll('.photo-card');
  const textArea = document.querySelector('.text-area');

  cards.forEach(card => {
    card.classList.remove('slide-in');
    card.classList.remove('active');
  });
  textArea.classList.remove('slide-in');

  setTimeout(() => {
    bgOverlay.classList.remove('active');
    gallery.classList.remove('active');
    closeBtn.classList.remove('active');
  }, 600);
}
// showGallery();
// document.getElementById('background-overlay').addEventListener('click', closeGallery);