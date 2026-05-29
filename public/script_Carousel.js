const slides = document.querySelectorAll(".mySlides");

let currentIndex = 0;

function moveCarousel() {
  currentIndex++;

  if (currentIndex >= slides.length) {
    currentIndex = 0;
  }

  slidesWrapper.style.transform =
    `translateX(-${currentIndex * 100}%)`;
}

setInterval(moveCarousel, 3000);