window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        button.classList.add('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (container && !container.contains(event.target)) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('moreWorksDropdown');
        const button = document.querySelector('.more-works-btn');
        if (!dropdown || !button) return;
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button.querySelector('.copy-text');
    
    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            // Success feedback
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');
    
    if (carouselVideos.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play().catch(e => {
                    // Autoplay failed, probably due to browser policy
                    console.log('Autoplay prevented:', e);
                });
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the video is visible
    });
    
    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

// Per-task rollout tabs: show one task's baseline/RPM pair at a time. Clicking a
// tab restarts that pair from zero and plays both, so the two clips are always
// compared from the same instant, and only the visible pair decodes.
function setupTaskTabs() {
    const tabs = Array.from(document.querySelectorAll('.task-tab'));
    if (tabs.length === 0) return;
    const panels = Array.from(document.querySelectorAll('.task-panel'));

    function clipsOf(panel) {
        return Array.from(panel.querySelectorAll('video'));
    }

    function rewind(video) {
        try { video.currentTime = 0; } catch (e) { /* metadata not in yet */ }
    }

    function startPair(panel) {
        const clips = clipsOf(panel);
        clips.forEach(rewind);
        clips.forEach(function(video) {
            video.play().catch(function() { /* autoplay may be blocked */ });
        });
    }

    // Loop the pair as a unit. The clips differ in length — the RPM run finishes
    // sooner — so looping them independently would drift them apart after one
    // pass. Waiting for both means the quicker one holds on its last frame,
    // which is itself the point being made.
    panels.forEach(function(panel) {
        const clips = clipsOf(panel);
        clips.forEach(function(video) {
            video.addEventListener('ended', function() {
                if (!panel.classList.contains('is-active')) return;
                if (clips.every(function(c) { return c.ended; })) startPair(panel);
            });
        });
    });

    function activate(index) {
        tabs.forEach(function(tab, i) {
            const on = i === index;
            tab.classList.toggle('is-active', on);
            tab.setAttribute('aria-selected', on ? 'true' : 'false');
            tab.tabIndex = on ? 0 : -1;
        });
        panels.forEach(function(panel, i) {
            const on = i === index;
            panel.classList.toggle('is-active', on);
            panel.hidden = !on;
            if (on) {
                startPair(panel);
            } else {
                clipsOf(panel).forEach(function(video) {
                    video.pause();
                    rewind(video);
                });
            }
        });
    }

    tabs.forEach(function(tab, i) {
        tab.addEventListener('click', function() { activate(i); });
        tab.addEventListener('keydown', function(event) {
            let step = 0;
            if (event.key === 'ArrowRight') step = 1;
            else if (event.key === 'ArrowLeft') step = -1;
            else return;
            event.preventDefault();
            const next = (i + step + tabs.length) % tabs.length;
            tabs[next].focus();
            activate(next);
        });
    });

    activate(0);
}

// Carousel/slider setup — only runs if the page actually uses them and the
// corresponding libraries are loaded.
document.addEventListener('DOMContentLoaded', function() {
    var options = {
		slidesToScroll: 1,
		slidesToShow: 1,
		loop: true,
		infinite: true,
		autoplay: true,
		autoplaySpeed: 5000,
    }

	// Initialize all div with carousel class
    if (typeof bulmaCarousel !== 'undefined' && document.querySelector('.carousel')) {
        bulmaCarousel.attach('.carousel', options);
    }

    if (typeof bulmaSlider !== 'undefined') {
        bulmaSlider.attach();
    }

    // Setup video autoplay for carousel
    setupVideoCarouselAutoplay();
    setupTaskTabs();
})
