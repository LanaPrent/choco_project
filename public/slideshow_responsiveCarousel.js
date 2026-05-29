//let slideIndex = 0;

const wrapper = document.querySelector(".slides-wrapper");
const slides = document.querySelectorAll(".slides-wrapper img");
const totalSlides = slides.length;


// Clone first slide and append at the end for seamless loop
const firstClone = slides[0].cloneNode(true);
wrapper.appendChild(firstClone);
let slideIndex = 0;
const slideWidth = 100;
const transitionTime = 1500;
const intervalTime=3000;

function moveSlides() {
  slideIndex++;
  wrapper.style.transition = `transform ${transitionTime}ms linear`;
  wrapper.style.transform = `translateX(-${slideIndex * slideWidth}%)`;

   // When reaching the clone, jump back to first slide instantly
  if (slideIndex === totalSlides) {
    setTimeout(() =>{
      wrapper.style.transition ='none';
      wrapper.style.transform = 'translateX(0)';
      slideIndex = 0;
    }, transitionTime);  
  }
}

setInterval(moveSlides, intervalTime);
