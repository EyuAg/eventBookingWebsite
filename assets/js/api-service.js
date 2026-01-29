class VenueAPIService {
    constructor() {
        this.baseURL = 'https://fakestoreapi.com';
        this.useMockAPI = true; 
    }

    // Generic fetch method with error handling
    async fetchData(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Get all venues
    async getVenues(params = {}) {
        if (this.useMockAPI) {
            return this.getMockVenues(params);
        }
        
        const { category, limit = 6, sort = 'desc' } = params;
        let url = `${this.baseURL}/products`;
        
        if (category && category !== 'all') {
            url = `${this.baseURL}/products/category/${category}`;
        }
        
        const products = await this.fetchData(`${url}?limit=${limit}&sort=${sort}`);
        return this.transformProductsToVenues(products);
    }

    // Get single venue
    async getVenue(id) {
        if (this.useMockAPI) {
            return this.getMockVenue(id);
        }
        
        const product = await this.fetchData(`${this.baseURL}/products/${id}`);
        return this.transformProductToVenue(product);
    }

    // Get venue categories
    async getCategories() {
        if (this.useMockAPI) {
            return this.getMockCategories();
        }
        
        return await this.fetchData(`${this.baseURL}/products/categories`);
    }

    // Mock data methods (fallback if API fails or for demo)
    async getMockVenues(params = {}) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const mockVenues = [
            {
                id: 1,
                name: "Sheraton Addis, a Luxury Collection Hotel",
                description: "More than just a hotel, the Sheraton Addis is an iconic landmark and the city's premier luxury venue for high-society weddings, corporate galas, and international meetings.",
                price: 15000.00,
                capacity: 500,
                image: "assets/images/Addis-Sheraton-Pool-Area.jpg",
                rating: 4.2,
                reviewCount: 24,
                amenities: [ "WiFi", "Parking", "Projector", "Catering Kitchen", "Dance Floor", "Stage", "Sound System"],
                tags: ["Weddings", "Corporate", "Luxury", "Banquet"],
                address: "Taitu St, Addis Ababa, Ethiopia.",
                category: "luxury",
                detailedDescription: "More than just a hotel, the Sheraton Addis is an iconic landmark and the city's premier luxury venue for high-society weddings, corporate galas, and international meetings. It offers multiple, beautifully appointed ballrooms (like the Menelik and Ras Ballrooms), extensive gardens, and world-class service. Its opulent setting is synonymous with elite events."
            },
            {
                id: 2,
                name: "Skylight International Hotel",
                description: "A modern and expansive venue owned by Ethiopian Airlines. It features the massive \"Cloud Nine\" ballroom, one of the largest pillar-free halls in East Africa, ideal for mega-weddings, product launches, and large conferences.",
                price: 10500.00,
                capacity: 300,
                image: "assets/images/refresh-yourself-at-aquarius.jpg",
                rating: 4.7,
                reviewCount: 47,
                amenities: ["Outdoor Space", "Garden", "Parking", "Catering Kitchen", "Restrooms", "Lighting"],
                tags: ["Outdoor", "Weddings", "Garden", "Nature"],
                address: "Bole,Next to Millennium Hall, Ethiopia",
                category: "outdoor",
                detailedDescription: "A modern and expansive venue owned by Ethiopian Airlines. It features the massive \"Cloud Nine\" ballroom, one of the largest pillar-free halls in East Africa, ideal for mega-weddings, product launches, and large conferences. The hotel also offers versatile meeting rooms, outdoor spaces, and superior catering services."
            },
            {
                id: 3,
                name: "Radisson Blu Hotel",
                description: "A leading international business hotel known for its excellent conference and meeting facilities. It features the \"Africa Ballroom\" and multiple flexible function rooms equipped with cutting-edge technology.",
                price: 12000.00,
                capacity: 200,
                image: "assets/images/9376b90c119d6824c692c66ef05a5d8b.jpeg",
                rating: 4.0,
                reviewCount: 18,
                amenities: ["WiFi", "Projector", "Air Conditioning", "Whiteboards", "Video Conferencing", "Breakout Rooms"],
                tags: ["Corporate", "Meetings", "Tech", "Conference"],
                address: "Kazanchis Business District, Addis Ababa, Ethiopia",
                category: "corporate",
                detailedDescription: "A leading international business hotel known for its excellent conference and meeting facilities. It features the \"Africa Ballroom\" and multiple flexible function rooms equipped with cutting-edge technology. It is a top-tier choice for corporate conferences, seminars, business lunches, and medium-to-large-scale professional events due to its central location and reliable standards."
            },
            {
                id: 4,
                name: "Kuriftu Resort & Spa",
                description: "Kuriftu Entoto is not just a venue; it's an experience. Perched onthe slopes of Entoto Mountain, it offers breathtaking, panoramic views over the entire city of Addis Ababa.",
                price: 18000.00,
                capacity: 400,
                image: "assets/images/684711f9071f8-unnamed.webp",
                rating: 4.5,
                reviewCount: 32,
                amenities: ["Air Conditioning", "WiFi", "Valet Parking", "Full Kitchen", "Bar Service", "Stage"],
                tags: ["Luxury", "Banquet", "Fine Dining", "Formal"],
                address: "Entoto Mountain, Addis Ababa, Ethiopia.",
                category: "luxury",
                detailedDescription: "Kuriftu Entoto is not just a venue; it's an experience. Perched on the slopes of Entoto Mountain, it offers breathtaking, panoramic views over the entire city of Addis Ababa. It is renowned for its rustic-chic Ethiopian architecture, using natural stone, wood, and traditional design elements to create a sense of serene luxury."
            },
            {
                id: 5,
                name: "Ghion Hotel",
                description: "Modern co-working space with high-speed internet, meeting rooms, and presentation equipment.",
                price: 8500.00,
                capacity: 150,
                image: "assets/images/IMG-20241113-WA0002.jpg",
                rating: 4.8,
                reviewCount: 56,
                amenities: ["Outdoor Space", "Garden", "Parking", "Meeting Rooms", "Whiteboards", "Projectors"],
                tags: ["Historic", "Garden", "Weddings", "Events"],
                address: "Ras Abebe Aregay St, Addis Ababa, Ethiopia",
                category: "tech",
                detailedDescription: "A historic hotel set within vast, serene gardens in the heart of the city. Ghion is a favorite for large outdoor events, garden weddings, cultural festivals, and relaxed yet sizable gatherings. Its ample green space, combined with its classic ballrooms, provides a versatile and picturesque setting away from the urban bustle."
            },
            {
                id: 6,
                name: "Millennium Hall",
                description: "This is Ethiopia's largest and most prestigious convention center, often called the \"UN Conference Center of Africa.\"",
                price: 7800.00,
                capacity: 100,
                image: "assets/images/6847c9a1616fb-unnamed (2).webp",
                rating: 4.3,
                reviewCount: 21,
                amenities: ["Open Space", "concerts", "Kitchenette", "WiFi", "Sound System"],
                tags: ["exhibitions", "concerts", "Creative", "Industrial"],
                address: "303 Creative Street, Addis Ababa",
                category: "art",
                detailedDescription: "This is Ethiopia's largest and most prestigious convention center, often called the \"UN Conference Center of Africa.\" It's a state-of-the-art facility built for major international conferences, large-scale exhibitions, trade fairs, and high-profile concerts. Its grandeur and capacity make it the top choice for diplomatic and pan-African events."
            }
        ];
        
        // Apply filters
        let filtered = [...mockVenues];
        
        if (params.category && params.category !== 'all') {
            filtered = filtered.filter(v => v.category === params.category);
        }
        
        if (params.search) {
            const searchTerm = params.search.toLowerCase();
            filtered = filtered.filter(v => 
                v.name.toLowerCase().includes(searchTerm) ||
                v.description.toLowerCase().includes(searchTerm) ||
                v.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }
        
        if (params.minPrice) {
            filtered = filtered.filter(v => v.price >= params.minPrice);
        }
        
        if (params.maxPrice) {
            filtered = filtered.filter(v => v.price <= params.maxPrice);
        }
        
        if (params.capacity) {
            filtered = filtered.filter(v => v.capacity >= params.capacity);
        }
        
        // Apply sorting
        if (params.sort === 'price_asc') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (params.sort === 'price_desc') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (params.sort === 'rating_desc') {
            filtered.sort((a, b) => b.rating - a.rating);
        } else if (params.sort === 'rating_asc') {
            filtered.sort((a, b) => a.rating - b.rating);
        }
        
        // Apply limit
        if (params.limit) {
            filtered = filtered.slice(0, params.limit);
        }
        
        return filtered;
    }

    async getMockVenue(id) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const venues = await this.getMockVenues();
        return venues.find(v => v.id == id) || venues[0];
    }

    async getMockCategories() {
        return ["all", "luxury", "outdoor", "corporate", "tech", "art", "weddings"];
    }

    // Transformation methods for FakeStore API
    transformProductsToVenues(products) {
        return products.map(product => this.transformProductToVenue(product));
    }

    transformProductToVenue(product) {
        return {
            id: product.id,
            name: product.title.length > 30 ? product.title.substring(0, 30) + '...' : product.title,
            description: product.description,
            price: (product.price * 1000).toFixed(2),
            capacity: Math.floor(Math.random() * 500) + 100,
            image: product.image,
            rating: product.rating?.rate || 4.0,
            reviewCount: product.rating?.count || Math.floor(Math.random() * 50) + 10,
            amenities: ['WiFi', 'Parking', 'Air Conditioning', 'Projector'],
            tags: [product.category],
            address: `${Math.floor(Math.random() * 1000)} ${product.category} Street, Addis Ababa`,
            category: product.category,
            detailedDescription: `${product.description}. This venue features modern amenities and professional staff to ensure your event is successful.`
        };
    }

    // Booking simulation
    async bookVenue(bookingData) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
            success: true,
            bookingId: `BK${Date.now()}`,
            message: "Booking confirmed successfully!",
            total: bookingData.totalPrice,
            dates: {
                start: bookingData.startDate,
                end: bookingData.endDate
            },
            venueName: bookingData.venueName || "Selected Venue"
        };
    }

    // Review submission
    async submitReview(reviewData) {
        await new Promise(resolve => setTimeout(resolve, 400));
        
        return {
            success: true,
            reviewId: `RV${Date.now()}`,
            message: "Thank you for your review!",
            rating: reviewData.rating,
            comment: reviewData.comment
        };
    }

    // Search venues
    async searchVenues(query) {
        const venues = await this.getMockVenues({});
        const searchTerm = query.toLowerCase();
        
        return venues.filter(venue => 
            venue.name.toLowerCase().includes(searchTerm) ||
            venue.description.toLowerCase().includes(searchTerm) ||
            venue.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
            venue.address.toLowerCase().includes(searchTerm)
        );
    }

    // Get featured venues (for homepage)
    async getFeaturedVenues() {
        return this.getMockVenues({ limit: 3 });
    }

    // Get venues for dashboard
    async getDashboardVenues(userType = 'customer') {
        await new Promise(resolve => setTimeout(resolve, 400));
        
        const venues = await this.getMockVenues({ limit: 4 });
        
        if (userType === 'owner') {
            // Add booking status for owner dashboard
            return venues.map(venue => ({
                ...venue,
                bookings: [
                    { id: 1, status: 'pending', customer: 'John Smith', date: '2024-03-15' },
                    { id: 2, status: 'confirmed', customer: 'Emma Wilson', date: '2024-04-20' }
                ]
            }));
        }
        
        return venues;
    }
}

// Create and export singleton instance
const VenueAPI = new VenueAPIService();
export default VenueAPI;