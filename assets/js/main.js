import VenueAPI from './api-service.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Set current year in footer
    const currentYearElements = document.querySelectorAll('#current-year');
    currentYearElements.forEach(element => {
        element.textContent = new Date().getFullYear();
    });

    // Mobile navigation toggle
    const navToggler = document.querySelector('.nav-toggler');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggler && navLinks) {
        navToggler.addEventListener('click', function() {
            navToggler.classList.toggle('toggler-open');
            navLinks.classList.toggle('open');
        });
        
        // Close mobile menu when clicking on a link
        const navLinksItems = navLinks.querySelectorAll('a');
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                navToggler.classList.remove('toggler-open');
                navLinks.classList.remove('open');
            });
        });
    }
    
    // Load venues on home page
    if (window.location.pathname.includes('index.html') || 
        window.location.pathname === '/' || 
        window.location.pathname.endsWith('/')) {
        await loadFeaturedVenues();
    }

    // Load venues on venues page
    if (window.location.pathname.includes('venues.html')) {
        await loadAllVenues();
        setupVenueFilters();
        setupSearch();
    }

    // Load single venue on detail page
    if (window.location.pathname.includes('venue-view.html')) {
        await loadVenueDetails();
        setupReviewForm();
        setupBookingForm();
    }

    // Load dashboard data
    if (window.location.pathname.includes('dashboard.html')) {
        await loadDashboardData();
    }

    // Initialize other components
    initForms();
    initEventListeners();
    initCustomCheckboxes();
    initBookingActions();
});

// ==================== VENUE LOADING FUNCTIONS ====================

async function loadFeaturedVenues() {
    const venuesContainer = document.querySelector('.venues-list');
    if (!venuesContainer) return;

    // Show loading state
    venuesContainer.innerHTML = `
        <div class="loading-spinner" style="text-align: center; padding: 3rem;">
            <div class="spinner"></div>
            <p style="margin-top: 1rem; color: #666;">Loading featured venues...</p>
        </div>
    `;

    try {
        const venues = await VenueAPI.getFeaturedVenues();
        
        if (venues.length === 0) {
            venuesContainer.innerHTML = '<p class="no-venues">No venues available at the moment.</p>';
            return;
        }

        venuesContainer.innerHTML = venues.map(venue => createVenueCardHTML(venue)).join('');
        
        // Initialize star ratings interaction
        initStarRatings();
        
    } catch (error) {
        console.error('Error loading featured venues:', error);
        showError(venuesContainer, 'Failed to load venues. Please try again later.');
    }
}

async function loadAllVenues() {
    const venuesContainer = document.querySelector('.venues-list');
    if (!venuesContainer) return;

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const filterParams = {
            search: urlParams.get('search') || '',
            category: urlParams.get('category') || 'all',
            minPrice: urlParams.get('minPrice') ? parseInt(urlParams.get('minPrice')) : null,
            maxPrice: urlParams.get('maxPrice') ? parseInt(urlParams.get('maxPrice')) : null,
            capacity: urlParams.get('capacity') ? parseInt(urlParams.get('capacity')) : null,
            sort: urlParams.get('sort') || 'rating_desc',
            limit: 12
        };

        // Show loading
        venuesContainer.innerHTML = '<div class="loading">Loading venues...</div>';

        const venues = await VenueAPI.getVenues(filterParams);
        
        if (venues.length === 0) {
            venuesContainer.innerHTML = '<p class="no-venues">No venues match your filters. Try different criteria.</p>';
            return;
        }

        venuesContainer.innerHTML = venues.map(venue => createVenueCardHTML(venue)).join('');
        
        // Update result count
        const resultCount = document.querySelector('.result-count');
        if (resultCount) {
            resultCount.textContent = `Showing ${venues.length} venues`;
        }
        
        // Initialize star ratings
        initStarRatings();
        
    } catch (error) {
        console.error('Error loading venues:', error);
        showError(venuesContainer, 'Error loading venues. Please try again.');
    }
}

async function loadVenueDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const venueId = urlParams.get('id') || 1;

    try {
        const venue = await VenueAPI.getVenue(venueId);
        
        if (!venue) {
            document.querySelector('.view-venue-section').innerHTML = `
                <div class="container wrapper" style="text-align: center; padding: 4rem;">
                    <h2 class="font-header-2">Venue not found</h2>
                    <p style="margin: 1rem 0;">The requested venue could not be found.</p>
                    <a href="venues.html" class="btn-link"><button class="btn btn-primary">Browse All Venues</button></a>
                </div>
            `;
            return;
        }

        // Update venue details
        updateVenueDetails(venue);
        
        // Load reviews
        await loadVenueReviews(venueId);
        
        // Initialize star ratings
        initStarRatings();
        
        // Update page title
        document.title = `VenueLink - ${venue.name}`;
        
    } catch (error) {
        console.error('Error loading venue details:', error);
        showError(document.querySelector('.view-venue-section'), 'Failed to load venue details.');
    }
}

function createVenueCardHTML(venue) {
    return `
        <div class="venue-card" data-venue-id="${venue.id}">
            <div class="image-container">
                <img src="${venue.image}" alt="${venue.name}" onerror="this.src='assets/images/hero-mini-photo.png'">
            </div>
            <div class="content">
                <div class="content-col">
                    <div class="title-bar">
                        <h3>${venue.name}</h3>
                        <div class="stars">
                            ${generateStarRating(venue.rating)}
                            <span>(${venue.reviewCount})</span>
                        </div>
                        <div class="venue-details">
                            <div class="detail-item">
                                <img src="assets/images/location.svg" alt="Location">
                                <span><span style="font-weight: 600;">Address:</span> ${venue.address}, Ethiopia</span>
                            </div>
                            <div class="detail-item">
                                <img src="assets/images/capacity.svg" alt="Capacity">
                                <span><span style="font-weight: 600;">Capacity:</span> ${venue.capacity}+</span>
                            </div>
                            <div class="detail-item">
                                <img src="assets/images/price.svg" alt="Price">
                                <span><span style="font-weight: 600;">Price:</span> ETB ${parseFloat(venue.price).toLocaleString()}/hr</span>
                            </div>
                        </div>
                    </div>
                    <div class="venue-tags">
                        ${venue.tags.map(tag => `<span class="venue-tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="content-col">
                    <p class="description">${venue.description}</p>
                    <div class="view-details">
                        <a href="venue-view.html?id=${venue.id}" class="link-btn">
                            <p class="link-text">View Details</p>
                            <svg class="arrow" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none">
                                <path stroke="#292A29" stroke-width=".5" d="M7.703 7.92H9.05l-2.746 2.746a.573.573 0 0 0 0 .806l.408.409c.22.22.583.222.806 0l2.747-2.747v1.346c0 .314.255.57.57.57h.577c.316 0 .57-.259.57-.57V6.836a.57.57 0 0 0-.201-.433.57.57 0 0 0-.433-.201H7.703a.572.572 0 0 0-.57.57v.578c0 .314.256.57.57.57Zm5.508-2.948a5.752 5.752 0 1 1-8.136 8.134 5.752 5.752 0 0 1 8.136-8.134Z"></path>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function updateVenueDetails(venue) {
    // Update main image
    const mainImage = document.querySelector('.venue-card-lg .image-container img');
    if (mainImage) {
        mainImage.src = venue.image;
        mainImage.alt = venue.name;
    }
    
    // Update venue name
    const venueName = document.querySelector('.venue-card-lg h3');
    if (venueName) venueName.textContent = venue.name;
    
    // Update rating
    const starsContainer = document.querySelector('.venue-card-lg .stars');
    if (starsContainer) {
        starsContainer.innerHTML = `${generateStarRating(venue.rating)}<span>(${venue.reviewCount})</span>`;
    }
    
    // Update address
    const addressElement = document.querySelector('.venue-card-lg .detail-item:nth-child(1) span');
    if (addressElement) {
        addressElement.innerHTML = `<span style="font-weight: 600;">Address:</span> ${venue.address}, Ethiopia`;
    }
    
    // Update capacity
    const capacityElement = document.querySelector('.venue-card-lg .detail-item:nth-child(2) span');
    if (capacityElement) {
        capacityElement.innerHTML = `<span style="font-weight: 600;">Capacity:</span> ${venue.capacity}+`;
    }
    
    // Update price
    const priceElement = document.querySelector('.venue-card-lg .detail-item:nth-child(3) span');
    if (priceElement) {
        priceElement.innerHTML = `<span style="font-weight: 600;">Price:</span> ETB ${parseFloat(venue.price).toLocaleString()}/hr`;
    }
    
    // Update description
    const descriptionElement = document.querySelector('.venue-card-lg .description');
    if (descriptionElement) {
        descriptionElement.textContent = venue.detailedDescription || venue.description;
    }
    
    // Update amenities
    const amenitiesElement = document.querySelector('.venue-card-lg p:nth-of-type(2)');
    if (amenitiesElement) {
        amenitiesElement.innerHTML = `<span style="font-weight: 600;">Amenities:</span> ${venue.amenities.join(', ')}`;
    }
    
    // Update tags
    const tagsContainer = document.querySelector('.venue-card-lg .venue-tags');
    if (tagsContainer) {
        tagsContainer.innerHTML = venue.tags.map(tag => `<span class="venue-tag">${tag}</span>`).join('');
    }
    
    // Update hidden venue ID in forms
    const venueIdInputs = document.querySelectorAll('input[name="venue_id"]');
    venueIdInputs.forEach(input => {
        input.value = venue.id;
    });
}

function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<span class="star filled">★</span>';
    }
    
    // Half star
    if (hasHalfStar) {
        starsHTML += '<span class="star half">★</span>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<span class="star">★</span>';
    }
    
    return starsHTML;
}

async function loadVenueReviews(venueId) {
    // Mock reviews for now - in a real app, these would come from API
    const reviews = [
        {
            id: 1,
            user: "Kaleb Tesfaye",
            rating: 5,
            comment: "Absolutely stunning venue! Our wedding was magical here. The staff was professional and attentive, making sure everything went smoothly.",
            date: "2024-01-15"
        },
        {
            id: 2,
            user: "Athrons Gebremedhin",
            rating: 4,
            comment: "Perfect for our corporate awards ceremony. The AV equipment was top-notch and the space accommodated all 400 guests comfortably.",
            date: "2023-12-05"
        },
        {
            id: 3,
            user: "yionas Mekonnen",
            rating: 3,
            comment: "Beautiful venue but parking was a bit challenging during peak hours. Otherwise, great experience for our graduation party.",
            date: "2023-11-20"
        }
    ];

    const reviewsContainer = document.querySelector('.venue-reviews');
    if (!reviewsContainer) return;

    // Remove existing demo reviews
    const existingReviews = reviewsContainer.querySelectorAll('.review-card.demo-review');
    existingReviews.forEach(review => review.remove());
    
    // Add API-loaded reviews
    const reviewsHTML = reviews.map(review => `
        <div class="review-card api-review">
            <div class="stars">
                ${generateStarRating(review.rating)}
            </div>
            <p class="review-content">${review.comment}</p>
            <small>By ${review.user} on ${new Date(review.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</small>
        </div>
    `).join('');

    const reviewForm = reviewsContainer.querySelector('.review-form');
    if (reviewForm) {
        reviewForm.insertAdjacentHTML('beforebegin', reviewsHTML);
    }
}
