class CircularSlider {
  constructor(container) {
    this.container = container;
    this.sliderInner = container.querySelector('.slider__inner');
    this.items = Array.from(container.querySelectorAll('.slider__item'));
    this.prevBtn = container.querySelector('.slider__btn--prev');
    this.nextBtn = container.querySelector('.slider__btn--next');
    
    this.currentIndex = 0;
    this.itemCount = this.items.length;
    this.spread = 275;
    
    this.init();
  }
  
  init() {
    this.updatePositions();
    this.addEventListeners();
  }
  
  addEventListeners() {
    // this.prevBtn.addEventListener('click', () => this.rotate(-1));
    // this.nextBtn.addEventListener('click', () => this.rotate(1));
    
    this.items.forEach((item, index) => {
      item.addEventListener('click', () => {
        if (index !== this.currentIndex) {
          this.navigateToIndex(index);
        }
      });
    });
  }
  
  navigateToIndex(targetIndex) {
    let forward = (targetIndex - this.currentIndex + this.itemCount) % this.itemCount;
    let backward = (this.currentIndex - targetIndex + this.itemCount) % this.itemCount;
    
    if (forward <= backward) {
      for (let i = 0; i < forward; i++) {
        setTimeout(() => this.rotate(1), i * 500);
      }
    } else {
      for (let i = 0; i < backward; i++) {
        setTimeout(() => this.rotate(-1), i * 500);
      }
    }
  }
  
  rotate(direction) {
    this.currentIndex = (this.currentIndex + direction + this.itemCount) % this.itemCount;
    this.updatePositions();
  }
  
  updatePositions() {
    this.items.forEach((item, index) => {
      let distance = index - this.currentIndex;
      
      if (distance > this.itemCount / 2) distance -= this.itemCount;
      if (distance < -this.itemCount / 2) distance += this.itemCount;
      
      const x = distance * this.spread;
      
      const maxDistance = 3;
      
      if (Math.abs(distance) <= maxDistance) {
        const factor = 1 - (Math.abs(distance) / maxDistance) * 0.5;
        const scale = Math.max(0.4, factor);
        const opacity = 1 - (Math.abs(distance) / maxDistance) * 0.8;
        const yShift = Math.abs(distance) * 10;
        
        item.style.transform = `
          translateX(-50%) 
          translateY(calc(-50% - ${yShift * Math.cbrt(scale)}px)) 
          translateX(${x * Math.cbrt(scale)}px)
          scale(${scale})
        `;
        item.style.opacity = opacity;
      } else {
        item.style.transform = `
          translateX(-50%) 
          translateY(-50%) 
          translateX(${x}px)
          scale(0)
        `;
        item.style.opacity = 0;
      }
      
      if (index === this.currentIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const sliderContainer = document.querySelector('.slider-container');
  if (sliderContainer) {
    new CircularSlider(sliderContainer);
  }
});