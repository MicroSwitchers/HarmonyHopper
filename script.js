document.addEventListener('DOMContentLoaded', () => {
    const covers = document.querySelectorAll('.cover');
    const menu = document.getElementById('menu');
    const menuToggle = document.getElementById('menuToggle');
    const gradientToggle = document.getElementById('gradientToggle');
    const colorOptions = document.getElementById('colorOptions');
    const outlineColorOptions = document.getElementById('outlineColorOptions');
    let currentIndex = 0;
    let audioElements = [];
    let isMusicStarted = false;
    let debounceTimer;
    let currentInputType = localStorage.getItem('inputType') || 'keyboard';
    let isGradient = localStorage.getItem('isGradient') === 'true';
    let currentColors = localStorage.getItem('colors') || '#e0c3fc,#8ec5fc'; // Default to purple-blue
    let currentOutlineColor = localStorage.getItem('outlineColor') || '#3498db'; // Default to blue
    let activeAlbums = JSON.parse(localStorage.getItem('activeAlbums')) || [0, 1, 2, 3, 4, 5];
    let isMenuOpen = false;

    // Initialize audio elements
    covers.forEach((cover, index) => {
        let audio = new Audio(`track${index + 1}.wav`);
        audio.loop = true;
        
        audio.onerror = () => {
            console.error(`Failed to load audio for track ${index + 1}`);
            audioElements[index] = {
                play: () => console.log(`Playing track ${index + 1} (audio not available)`),
                pause: () => console.log(`Pausing track ${index + 1} (audio not available)`)
            };
        };
        
        audioElements.push(audio);
    });

    // Create switch sound effect
    const switchSound = new Audio('switch_sound.wav');
    switchSound.onerror = () => {
        console.error('Failed to load switch sound');
        switchSound.play = () => console.log('Switch sound (not available)');
    };

    function updateActiveCover(startPlaying = false) {
        covers.forEach((cover, index) => {
            cover.classList.remove('active');
            cover.style.outline = '';
            cover.style.outlineOffset = '';
            audioElements[index].pause();
        });

        covers[currentIndex].classList.add('active');
        covers[currentIndex].style.outline = `5px solid ${currentOutlineColor}`;
        covers[currentIndex].style.outlineOffset = '5px';

        if (startPlaying || isMusicStarted) {
            audioElements[currentIndex].play();
            isMusicStarted = true;
        }

        switchSound.play();
    }

    function activateSwitch() {
        if (debounceTimer) return;

        debounceTimer = setTimeout(() => {
            if (!isMusicStarted) {
                isMusicStarted = true;
                updateActiveCover(true);
            } else {
                const activeAlbumsIndex = activeAlbums.indexOf(currentIndex);
                const nextIndex = (activeAlbumsIndex + 1) % activeAlbums.length;
                currentIndex = activeAlbums[nextIndex];
                updateActiveCover();
            }
            
            // Ensure the outline is visible
            const activecover = document.querySelector('.cover.active');
            if (activecover) {
                activecover.style.outline = `5px solid ${currentOutlineColor}`;
                activecover.style.outlineOffset = '5px';
            }

            debounceTimer = null;
        }, 300);
    }

    function applyInitialOutlineColor() {
        const activecover = document.querySelector('.cover.active');
        if (activecover) {
            activecover.style.outline = `5px solid ${currentOutlineColor}`;
            activecover.style.outlineOffset = '5px';
        }
    }

    function setInputType(type) {
        currentInputType = type;
        localStorage.setItem('inputType', type);
        updateActiveButton();
    }

    function updateActiveButton() {
        menu.querySelectorAll('.input-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.id === `${currentInputType}Btn`) {
                btn.classList.add('active');
            }
        });
    }

    function updateBackground() {
        const [color1, color2] = currentColors.split(',');
        if (isGradient) {
            document.body.style.background = `linear-gradient(to right, ${color1}, ${color2})`;
        } else {
            document.body.style.background = color1;
        }
        updateColorPreviews();
    }

    function updateColorPreviews() {
        colorOptions.querySelectorAll('.color-btn').forEach(btn => {
            const [color1, color2] = btn.dataset.colors.split(',');
            const [name1, name2] = btn.dataset.names.split(',');
            const preview = btn.querySelector('.color-preview');
            const nameElement = btn.querySelector('.color-name');
            if (isGradient) {
                preview.style.background = `linear-gradient(to right, ${color1}, ${color2})`;
                nameElement.textContent = `${name1}-${name2}`;
            } else {
                preview.style.background = color1;
                nameElement.textContent = name1;
            }
        });
    }

    function updateOutlineColor(color) {
        currentOutlineColor = color;
        localStorage.setItem('outlineColor', color);
        
        // Update the active outline immediately
        const activecover = document.querySelector('.cover.active');
        if (activecover) {
            activecover.style.outline = `5px solid ${color}`;
            activecover.style.outlineOffset = '5px';
        }
    }

    function updateOutlineColorButtons() {
        outlineColorOptions.querySelectorAll('.outline-color-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.color === currentOutlineColor) {
                btn.classList.add('active');
            }
        });
    }

    function updateActiveAlbums() {
        activeAlbums = Array.from(document.querySelectorAll('.album-thumbnail.active'))
            .map(thumbnail => parseInt(thumbnail.dataset.index));
        localStorage.setItem('activeAlbums', JSON.stringify(activeAlbums));
        updateCoverFlow();
    }

    function updateCoverFlow() {
        covers.forEach((cover, index) => {
            if (activeAlbums.includes(index)) {
                cover.style.display = '';
            } else {
                cover.style.display = 'none';
                if (cover.classList.contains('active')) {
                    audioElements[index].pause();
                    currentIndex = activeAlbums[0] || 0;
                    updateActiveCover();
                }
            }
        });
    }

    // Menu toggle
    menuToggle.addEventListener('click', () => {
        menu.classList.toggle('open');
        isMenuOpen = menu.classList.contains('open');
    });

    // Input type selection
    menu.addEventListener('click', (e) => {
        if (e.target.classList.contains('input-btn')) {
            const inputType = e.target.id.replace('Btn', '');
            setInputType(inputType);
        }
    });

   // Background options
   gradientToggle.checked = isGradient;
   gradientToggle.addEventListener('change', (e) => {
       isGradient = e.target.checked;
       localStorage.setItem('isGradient', isGradient);
       updateBackground();
   });

   colorOptions.addEventListener('click', (e) => {
       const colorBtn = e.target.closest('.color-btn');
       if (colorBtn) {
           currentColors = colorBtn.dataset.colors;
           localStorage.setItem('colors', currentColors);
           updateBackground();
       }
   });

   // Outline color selection
   outlineColorOptions.addEventListener('click', (e) => {
       const outlineColorBtn = e.target.closest('.outline-color-btn');
       if (outlineColorBtn) {
           const newColor = outlineColorBtn.dataset.color;
           updateOutlineColor(newColor);
           // Update active button state if needed
           document.querySelectorAll('.outline-color-btn').forEach(btn => btn.classList.remove('active'));
           outlineColorBtn.classList.add('active');
       }
   });

   // Album selection event listener
   document.getElementById('albumSelection').addEventListener('click', (e) => {
       if (e.target.classList.contains('album-thumbnail')) {
           e.target.classList.toggle('active');
           updateActiveAlbums();
       }
   });

   // Initialize album thumbnails
   document.querySelectorAll('.album-thumbnail').forEach((thumbnail) => {
       const index = parseInt(thumbnail.dataset.index);
       thumbnail.classList.toggle('active', activeAlbums.includes(index));
   });

   // Update cover flow on initial load
   updateCoverFlow();

   // Keyboard event listener
   document.addEventListener('keydown', (e) => {
       if (currentInputType === 'keyboard' && !isMenuOpen) {
           e.preventDefault();
           activateSwitch();
       } else if (e.key === 'k' || e.key === 'K') {
           setInputType('keyboard');
       }
   });

   // Mouse event listeners
   document.addEventListener('mousedown', (e) => {
       if (!isMenuOpen && 
           ((currentInputType === 'leftMouse' && e.button === 0) ||
            (currentInputType === 'rightMouse' && e.button === 2))) {
           e.preventDefault();
           activateSwitch();
       }
   });

   // Prevent context menu on right-click
   document.addEventListener('contextmenu', (e) => {
       if (currentInputType === 'rightMouse') {
           e.preventDefault();
       }
   });

   // Touch event listener for mobile devices
   document.addEventListener('touchstart', (e) => {
       if (currentInputType === 'leftMouse' && !isMenuOpen) {
           e.preventDefault();
           activateSwitch();
       }
   });

   // Initialize
   updateActiveButton();
   updateBackground();
   updateOutlineColor(currentOutlineColor);
   applyInitialOutlineColor();
   updateCoverFlow();

   // On page load, set the initial outline color
   const savedColor = localStorage.getItem('outlineColor') || '#3498db';
   updateOutlineColor(savedColor);

   // Update background and outline color
   updateBackground();
   updateOutlineColor(currentOutlineColor);

   // Update outline color buttons
   updateOutlineColorButtons();

   // ... rest of your initialization code ...
});