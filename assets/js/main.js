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

// ==================== FORM HANDLING ====================

function setupVenueFilters() {
    const filterForm = document.querySelector('.filter-form');
    if (!filterForm) return;

    filterForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const params = new URLSearchParams();
        
        for (let [key, value] of formData.entries()) {
            if (value) params.append(key, value);
        }
        
        // Update URL without reloading the page
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', newUrl);
        
        // Reload venues with new filters
        await loadAllVenues();
        
        // Show success message
        showToast('Filters applied successfully!');
    });
}

function setupSearch() {
    const searchInput = document.querySelector('input[name="search"]');
    const searchButton = document.querySelector('.filter-form button[type="submit"]');
    
    if (searchInput && searchButton) {
        // Real-time search on typing (with debounce)
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                if (this.value.length >= 2) {
                    await performSearch(this.value);
                } else if (this.value.length === 0) {
                    await loadAllVenues();
                }
            }, 500);
        });
        
        // Search on button click
        searchButton.addEventListener('click', async function(e) {
            e.preventDefault();
            await performSearch(searchInput.value);
        });
    }
}

async function performSearch(query) {
    try {
        const venuesContainer = document.querySelector('.venues-list');
        venuesContainer.innerHTML = '<div class="loading">Searching venues...</div>';
        
        const venues = await VenueAPI.searchVenues(query);
        
        if (venues.length === 0) {
            venuesContainer.innerHTML = `<p class="no-venues">No venues found for "${query}". Try different keywords.</p>`;
            return;
        }
        
        venuesContainer.innerHTML = venues.map(venue => createVenueCardHTML(venue)).join('');
        initStarRatings();
        
    } catch (error) {
        console.error('Search error:', error);
        showError(document.querySelector('.venues-list'), 'Search failed. Please try again.');
    }
}

function setupReviewForm() {
    const reviewForm = document.querySelector('.review-form');
    if (!reviewForm) return;

    reviewForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const rating = this.querySelector('select[name="rating"]').value;
        const comment = this.querySelector('textarea[name="comment"]').value;
        const venueId = this.querySelector('input[name="venue_id"]')?.value || 1;
        
        if (!comment.trim()) {
            alert('Please enter a review comment');
            return;
        }
        
        try {
            const result = await VenueAPI.submitReview({
                venueId: venueId,
                rating: parseInt(rating),
                comment: comment.trim()
            });
            
            if (result.success) {
                showToast('Review submitted successfully!');
                this.reset();
                // Reload reviews
                await loadVenueReviews(venueId);
            }
        } catch (error) {
            console.error('Review submission error:', error);
            showToast('Failed to submit review. Please try again.', 'error');
        }
    });
}

function setupBookingForm() {
    const bookingForm = document.querySelector('.book-form');
    if (!bookingForm) return;

    bookingForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const startDate = this.querySelector('input[name="start_date"]').value;
        const endDate = this.querySelector('input[name="end_date"]').value;
        const venueId = this.querySelector('input[name="venue_id"]')?.value || 1;
        
        if (!startDate || !endDate) {
            alert('Please select both start and end dates');
            return;
        }
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (start < today) {
            alert('Start date cannot be in the past');
            return;
        }
        
        if (end < start) {
            alert('End date must be after start date');
            return;
        }
        
        // Calculate days and price
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        const pricePerDay = 24 * 15000; // Example: 24 hours * ETB 15,000/hour
        const totalPrice = days * pricePerDay;
        
        try {
            const result = await VenueAPI.bookVenue({
                venueId: venueId,
                startDate: startDate,
                endDate: endDate,
                totalPrice: totalPrice,
                venueName: document.querySelector('.venue-card-lg h3')?.textContent || 'Selected Venue'
            });
            
            if (result.success) {
                showToast(`Booking confirmed! Booking ID: ${result.bookingId}`);
                // In a real app, redirect to confirmation page
                setTimeout(() => {
                    window.location.href = `dashboard.html?booking=${result.bookingId}`;
                }, 1500);
            }
        } catch (error) {
            console.error('Booking error:', error);
            showToast('Booking failed. Please try again.', 'error');
        }
    });
}

// ==================== DASHBOARD FUNCTIONS ====================

async function loadDashboardData() {
    // Determine user type from URL or default to customer
    const urlParams = new URLSearchParams(window.location.search);
    const userType = urlParams.get('user') || 'customer';
    
    try {
        const venues = await VenueAPI.getDashboardVenues(userType);
        
        // Update dashboard sections based on user type
        if (userType === 'owner') {
            updateOwnerDashboard(venues);
        } else {
            updateCustomerDashboard(venues);
        }
        
    } catch (error) {
        console.error('Dashboard data error:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

function updateOwnerDashboard(venues) {
    // Update venues list
    const venuesList = document.querySelector('#owner-dashboard table tbody');
    if (venuesList) {
        venuesList.innerHTML = venues.map(venue => `
            <tr>
                <td>${venue.name}</td>
                <td>${venue.bookings?.[0]?.customer || 'No bookings'}</td>
                <td>${venue.bookings?.[0]?.date || 'N/A'}</td>
                <td>${venue.bookings?.[1]?.date || 'N/A'}</td>
                <td>${new Date().toISOString().split('T')[0]}</td>
                <td>ETB ${parseFloat(venue.price).toLocaleString()}</td>
                <td><span class="status-${venue.bookings?.[0]?.status || 'pending'}">${venue.bookings?.[0]?.status || 'pending'}</span></td>
                <td>
                    <a href="#" class="btn-link accept-booking" data-booking="1"><button class="btn btn-primary-2">Accept</button></a>
                    <a href="#" class="btn-link reject-booking" data-booking="1"><button class="btn btn-tertiary">Reject</button></a>
                </td>
            </tr>
        `).join('');
    }
}

function updateCustomerDashboard(venues) {
    // Update customer bookings
    const bookingsList = document.querySelector('#customer-dashboard table tbody');
    if (bookingsList) {
        bookingsList.innerHTML = venues.map((venue, index) => {
            const statuses = ['pending', 'confirmed', 'cancelled'];
            const status = statuses[index % statuses.length];
            const startDate = new Date();
            startDate.setDate(startDate.getDate() + (index + 1) * 7);
            
            return `
                <tr>
                    <td>${venue.name}</td>
                    <td>${startDate.toISOString().split('T')[0]}</td>
                    <td>${new Date(startDate.getTime() + 86400000).toISOString().split('T')[0]}</td>
                    <td>${new Date().toISOString().split('T')[0]}</td>
                    <td>ETB ${parseFloat(venue.price).toLocaleString()}</td>
                    <td><span class="status-${status}">${status}</span></td>
                </tr>
            `;
        }).join('');
    }
}