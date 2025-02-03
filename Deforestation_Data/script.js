// Card data with image URLs and corresponding sound files
const cards = [
    { image: 'images/image1.png', sound: 'sounds/sound1.mp3' },
    { image: 'images/image2.png', sound: 'sounds/sound2.mp3' },
    { image: 'images/image3.png', sound: 'sounds/sound3.mp3' },
    { image: 'images/image4.png', sound: 'sounds/sound4.mp3' }
];

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize GSAP animations
    if (typeof gsap !== 'undefined' && gsap.Flip) {
        // Your GSAP Flip animations here
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const state = gsap.Flip.getState(cards);
                
                // Toggle expanded class
                cards.forEach(c => c.classList.remove('expanded'));
                card.classList.add('expanded');
                
                // Animate the change
                gsap.Flip.from(state, {
                    duration: 0.5,
                    ease: 'power2.inOut',
                    absolute: true
                });
            });
        });
    }
    
    // Initialize sonification
    const sonifyBtn = document.querySelector('.sonify-btn');
    if (sonifyBtn) {
        sonifyBtn.addEventListener('click', async () => {
            try {
                // Start audio context on user interaction
                await Tone.start();
                
                // Toggle sonification
                if (window.deforestationSonifier) {
                    window.deforestationSonifier.toggle();
                    sonifyBtn.classList.toggle('playing');
                    sonifyBtn.textContent = sonifyBtn.classList.contains('playing') ? 
                        'STOP SONIFICATION' : 'SONIFY DATA';
                }
            } catch (error) {
                console.error('Error starting audio:', error);
            }
        });
    }

    // Initialize region selector
    const regionSelect = document.getElementById('region-select');
    if (regionSelect && window.deforestationSonifier) {
        // Clear existing options
        regionSelect.innerHTML = '';
        
        // Add "All Regions" option
        const allOption = document.createElement('option');
        allOption.value = 'All Regions';
        allOption.textContent = '전체 지역';
        regionSelect.appendChild(allOption);
        
        // Add region options with Korean names
        const regions = [
            { value: 'Seoul Capital Area', text: '수도권' },
            { value: 'Yeongnam Region', text: '영남권' },
            { value: 'Honam Region', text: '호남권' },
            { value: 'Chungcheong Region', text: '충청권' },
            { value: 'Gangwon Region', text: '강원권' }
        ];
        
        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region.value;
            option.textContent = region.text;
            regionSelect.appendChild(option);
        });
        
        // Add change event listener
        regionSelect.addEventListener('change', () => {
            if (window.deforestationSonifier) {
                window.deforestationSonifier.currentRegion = regionSelect.value;
                window.deforestationSonifier.updateDisplay(window.deforestationSonifier.data[window.deforestationSonifier.currentIndex]);
            }
        });
    }

    // Initial card animation
    gsap.from('.card', {
        duration: 0.5,
        opacity: 0,
        y: 100,
        stagger: 0.1,
        ease: "power1.out"
    });
});
