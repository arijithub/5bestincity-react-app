const metaConfig = {
  home: {
    title: "Find Top Local Businesses, Exclusive Amazon Offers, One-Click NearMe - 5BestInCity",
    metaTitle: "Find Top Local Businesses, Exclusive Amazon Offers, One-Click NearMe - 5BestInCity",
    metaDescription: "Find Top Local Businesses near you. Grab exclusive Amazon Offers, One-Click NearMe search, Enjoy Interesting Collections from our community only on 5BestInCity App.",
  },
  listing: {
    title: "5 Best {subcategory} near you in {city}, {state} - 5BestInCity",
	metaTitle: "Top {subcategory} near you in {city}, {state} - 5BestInCity",
	metaDescription: "Discover the 5 best {subcategory} in {city}, {state} for your needs on 5BestInCity. Get Phone Numbers, Address, Reviews, Photos, maps for Top {subcategory} near you in {city}.",
  },
  city: {
    title: "Find Best Businesses, Services, Places in your city on 5BestInCity",
    metaTitle: "Find Best Businesses, Services, Places in your city on 5BestInCity",
    metaDescription: "Discover the best places, businesses, and services in your city. Local recommendations, reviews, and more.",
  },
 profile: {
    title: "{businessName} in {city}, {state} - Best {subcategory} near you in {city} - 5BestInCity",
	metaTitle: "{businessName} in {city}, {state} - Best {subcategory} near you in {city} - 5BestInCity",
	metaDescription: "{businessName} in {city}, {state}. Top {subcategory} in {city}. View services, Fees, Contact number, business hours, customer reviews, Address and Map of {businessName} in {city}.",
  },
  category: {
    title: "Explore Top Local Businesses, Services, Places in {city}, {state} - 5BestInCity",
    metaTitle: "Explore Top Local Businesses, Services, Places in {city}, {state} - 5BestInCity",
    metaDescription: "Discover the best local businesses and services in {city}, {state}. Find the best restaurants, gyms, cafes, parlors, doctors, agents, clinics, consultants and more on 5BestInCity..",
  },
 collections: {
    title: "Explore Curated Collections - 5BestInCity",
    metaTitle: "Explore Curated Collections - 5BestInCity",
    metaDescription: "Discover and explore curated collections of the best local businesses, services, and places. Find recommendations from our community on 5BestInCity.",
  },
  pinnedBusinesses: {
    title: "My Favorite Businesses - 5BestInCity",
    metaTitle: "My Favorite Businesses - 5BestInCity",
    metaDescription: "View and manage your favorite local businesses. Quick access to contact information, services, and locations of your pinned businesses on 5BestInCity.",
  },
  webApps: {
    title: "Instant access to 500+ most used websites - 5BestInCity",
    metaTitle: "Instant access to 500+ most used websites - 5BestInCity",
    metaDescription: "Instant access to 300+ most used web applications. No need to download multiple apps. Access anytime, anywhere absolutely Free! Create your own bookmarks with ease. Get the 5BestInCity App.",
  },
  nearMe: {
    title: "Find things near you with just One Click - 5BestInCity",
    metaTitle: "Find things near you with just One Click - 5BestInCity",
    metaDescription: "Look for things near you with just One Click. Find restaurents, gyms, parlors, doctors, clinics, consultants, travel agents, hotels, cafes, parks ... ",
  },
  webCategory: {
    title: "{categoryName} Tools & Resources | Web Applications",
    metaTitle: "{categoryName} - Web Tools & Applications | Near Me App",
    metaDescription: "Explore useful {categoryName} tools and web applications. Find the best online resources and services for {categoryName}, including {subcategories}.",
  },
  pinnedCollections: {
    title: "My Favorite Collections - 5BestInCity",
    metaTitle: "My Favorite Collections - 5BestInCity",
    metaDescription: "Access your favorite curated collections. Discover the best recommendations and places saved from our community on 5BestInCity.",
  },
  shareCollections: {
    title: "{collectionTitle} by {creatorName} - 5BestInCity",
    metaTitle: "{collectionTitle} - A Collection by {creatorName} | {categories} - 5BestInCity",
    metaDescription: "Explore {collectionTitle}, a curated collection by {creatorName}. Features {itemCount} items across {categories}. {description}",
  },
  viewSharedCollections: {
    title: "{collectionTitle} by {creatorName} - 5BestInCity",
    metaTitle: "{collectionTitle} - A Collection by {creatorName} | {categories} - 5BestInCity",
    metaDescription: "Explore {collectionTitle}, a curated collection by {creatorName}. Features {itemCount} items across {categories}. {description}",
  },
  amazon: {
    title: "Shop on Amazon India - 5BestInCity",
    metaTitle: "Get Best Deals from Amazon Shopping - Shop Smart & Save Big with 5BestInCity",
    metaDescription: "Save Big while you shop on your trusted and favourite Amazon Shopping. Exclusive Best Deals and products curated for you on 5BestInCity App.",
  },
  deleteInfo: {
    title: "Delete My Information from 5BestInCity",
    metaTitle: "Delete My Account & Information - 5BestInCity",
    metaDescription: "Easily delete your account, activity history, likes, and reviews from 5BestInCity. Manage your privacy and data with our simple deletion process.",
  }
};

const generateMetaContent = (config, data = {}) => {
  const { 
    city_name, 
    state_name, 
    subcategory_name,
    business_name,
    subcatName // Add this to handle subcatName from pageInfo
  } = data;
  
  if (!city_name || !state_name) {
    return config;
  }

  const replacements = {
    '{city}': city_name,
    '{state}': state_name,
    '{category}': subcategory_name || '',
    '{businessName}': business_name || '',
    '{subcategory}': subcatName || subcategory_name || '' // Use either subcatName or subcategory_name
  };

  const pattern = /{city}|{state}|{category}|{businessName}|{subcategory}/g;

  return {
    title: config.title.replace(pattern, match => replacements[match]),
    metaTitle: config.metaTitle.replace(pattern, match => replacements[match]),
    metaDescription: config.metaDescription.replace(pattern, match => replacements[match])
  };
};


// New function specifically for collection data
const generateCollectionMeta = (config, data = {}) => {
  const { 
    collection_title, 
    creator_name,
    categories,
    description,
    item_count
  } = data;

  if (!collection_title || !creator_name) {
    return config;
  }

  // Format categories into a readable string
  const categoryString = Array.isArray(categories) 
    ? categories.map(cat => cat.name).join(', ')
    : categories;

  // Trim description to reasonable length for meta tag
  const trimmedDescription = description 
    ? description.length > 150 
      ? description.substring(0, 147) + '...' 
      : description
    : '';

  const replacements = {
    '{collectionTitle}': collection_title,
    '{creatorName}': creator_name,
    '{categories}': categoryString,
    '{description}': trimmedDescription,
    '{itemCount}': item_count || '0'
  };

  const pattern = /{collectionTitle}|{creatorName}|{categories}|{description}|{itemCount}/g;

  return {
    title: config.title.replace(pattern, match => replacements[match] || ''),
    metaTitle: config.metaTitle.replace(pattern, match => replacements[match] || ''),
    metaDescription: config.metaDescription.replace(pattern, match => replacements[match] || '')
  };
};

const generateWebCategoryMeta = (config, data = {}) => {
  const { 
    category_name,
    subcategories = [],
    linkCount = 0
  } = data;
  
  if (!category_name) {
    return config;
  }

  // Get unique subcategories (up to 3) for meta description
  const subcategoryNames = subcategories
    .slice(0, 3)
    .map(sub => sub.sub_category_name)
    .join(', ');

  const replacements = {
    '{categoryName}': category_name,
    '{subcategories}': subcategoryNames,
    '{linkCount}': linkCount.toString()
  };

  const pattern = /{categoryName}|{subcategories}|{linkCount}/g;

  return {
    title: config.title.replace(pattern, match => replacements[match] || ''),
    metaTitle: config.metaTitle.replace(pattern, match => replacements[match] || ''),
    metaDescription: config.metaDescription.replace(pattern, match => replacements[match] || '')
  };
};


export { 
  metaConfig as default, 
  generateMetaContent,
  generateCollectionMeta,
  generateWebCategoryMeta
};