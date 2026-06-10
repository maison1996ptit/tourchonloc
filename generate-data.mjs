import * as fs from 'fs';

const destinations = ['Vietnam', 'Japan', 'Indonesia', 'Thailand', 'France', 'Italy', 'Switzerland', 'Australia', 'USA', 'Iceland'];
const categories = ['Cultural', 'Leisure', 'Adventure', 'Luxury', 'Family'];

function generateTours() {
  const tours = [];
  let idCount = 1;

  destinations.forEach(dest => {
    for (let i = 1; i <= 10; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const durationDays = 5 + Math.floor(Math.random() * 10);
      const id = String(idCount++);
      
      const departures = [];
      for(let d = 0; d < 5; d++) {
        const date = new Date();
        date.setMonth(date.getMonth() + d + 1);
        date.setDate(10 + Math.floor(Math.random() * 15));
        departures.push(date.toISOString().split('T')[0]);
      }

      tours.push({
        id,
        title: `${dest} ${category} Tour #${i}`,
        slug: `${dest.toLowerCase()}-${category.toLowerCase()}-tour-${id}`,
        category,
        destination: dest,
        region: 'Global',
        durationDays,
        durationNights: durationDays - 1,
        priceFrom: 500 + Math.floor(Math.random() * 3000),
        departureDates: departures,
        shortDescription: `An amazing ${category.toLowerCase()} experience in ${dest}.`,
        overview: `Enjoy a comprehensive ${durationDays}-day journey through ${dest}. Experience the best of ${category.toLowerCase()} activities and local culture.`,
        highlights: [`Visit iconic landmarks in ${dest}`, `Authentic ${dest} cuisine`, `Professional local guides`],
        itinerary: [
          { day: 1, title: 'Arrival', description: `Welcome to ${dest}! Transfer to your hotel.` },
          { day: 2, title: 'City Exploration', description: `Discover the heart of ${dest} with our expert guides.` },
          { day: durationDays, title: 'Departure', description: 'Transfer to airport for your flight home.' }
        ],
        included: ['Accommodation', 'Transfers', 'Breakfast', 'Guide'],
        excluded: ['International flights', 'Insurance', 'Personal expenses'],
        priceByGroupSize: [{ groupSize: '2-4', pricePerPerson: 1000 }],
        seoTitle: `${dest} ${category} Tour - Book Now`,
        seoDescription: `Join our ${dest} ${category} tour for an unforgettable experience.`,
        status: 'Published',
        images: [`https://images.unsplash.com/photo-${1500000000000 + idCount}?auto=format&fit=crop&w=1000`],
        featuredImage: `https://images.unsplash.com/photo-${1500000000000 + idCount}?auto=format&fit=crop&w=1000`,
        isFeatured: i === 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  });
  return tours;
}

function generateBlogs() {
  const blogs = [];
  for (let i = 1; i <= 100; i++) {
    blogs.push({
      id: String(i),
      title: `Travel Guide to ${destinations[i % destinations.length]} - Part ${Math.floor(i / 10) + 1}`,
      slug: `travel-guide-dest-${i}`,
      content: 'Full content for the blog post...',
      excerpt: `Discover the secrets of ${destinations[i % destinations.length]} in this comprehensive guide.`,
      author: 'Admin',
      categoryId: 'Travel Tips',
      category: 'Travel Tips',
      tags: ['Travel', destinations[i % destinations.length]],
      thumbnail: `https://images.unsplash.com/photo-${1600000000000 + i}?auto=format&fit=crop&w=800`,
      status: 'Published',
      publishedDate: new Date().toISOString(),
      seoTitle: `Guide to ${destinations[i % destinations.length]}`,
      seoDescription: 'Read our latest travel tips and guides.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  return blogs;
}

const toursData = generateTours();
const blogsData = generateBlogs();

const toursFileContent = `import { Tour } from '@/types/tour';\n\nexport const mockTours: Tour[] = ${JSON.stringify(toursData, null, 2)};`;
const blogsFileContent = `import { Blog } from '@/types/blog';\n\nexport const mockBlogs: Blog[] = ${JSON.stringify(blogsData, null, 2)};`;

fs.writeFileSync('src/data/tours.ts', toursFileContent);
fs.writeFileSync('src/data/blogs.ts', blogsFileContent);

console.log('Successfully generated 100 tours and 100 blogs!');
