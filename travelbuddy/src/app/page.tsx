// Improved app/page.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Improved button contrast */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Never Travel Alone Again
              </h1>
              <p className="text-xl mb-8">
                Find companions for your next adventure. Connect with travelers
                heading to your dream destination and create unforgettable memories together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/trips"
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold text-center hover:bg-blue-50 transition shadow-lg hover:shadow-xl">
                  Find Travel Buddies
                </Link>
                <Link href="/trips/create"
                  className="bg-blue-500 bg-opacity-20 backdrop-blur-sm border-2 border-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-opacity-30 transition text-white shadow-lg hover:shadow-xl">
                  Create Your Trip
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative h-80 w-full">
                <Image
                  src="/images/travel-hero.webp"
                  alt="People traveling together"
                  fill
                  className="object-cover rounded-lg shadow-xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How TravelBuddy Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition duration-300">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Create Your Profile</h3>
              <p className="text-gray-600">
                Sign up and tell us about yourself, your travel style, and preferences.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition duration-300">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Find or Create Trips</h3>
              <p className="text-gray-600">
                Search for people traveling to your destination or create your own trip listing.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition duration-300">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect & Travel</h3>
              <p className="text-gray-600">
                Message potential travel buddies, plan together, and enjoy your journey!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations - Improved hover effects */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Destinations</h2>

          <div className="grid md:grid-cols-4 gap-6">
            {['Italy', 'Japan', 'Thailand', 'Mexico'].map((destination) => (
              <Link href={`/trips?destination=${destination}`} key={destination}
                className="block group">
                <div className="relative h-64 rounded-lg overflow-hidden shadow-md transition duration-300 hover:shadow-xl">
                  <Image
                    src={`/images/${destination.toLowerCase()}.jpg`}
                    alt={destination}
                    fill
                    className="object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="text-white text-xl font-bold">{destination}</h3>
                    <p className="text-white/80 text-sm group-hover:text-white transition">Explore trips</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Improved button */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready for Your Next Adventure?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join TravelBuddy today and discover new friends who share your passion for travel.
          </p>
          <Link href="/auth/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold inline-block hover:bg-blue-50 transition shadow-lg hover:shadow-xl">
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  );
}