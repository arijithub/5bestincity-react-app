const API_BASE_URL = "https://myapps.5bestincity.com/api/app-5best-api/";
const API_EASY_PROFILE_URL = "https://myapps.5bestincity.com/api/IN/5best/";
const SEARCH_ENGINE_IMAGE_BASE_URL = "https://apps.5bestincity.com/";
const CATEGORY_IMAGE_BASE_URL = "https://5bestincity.com/images/public/category/"; // New constant
const COUNTRY_IMAGE_BASE_URL = "https://5bestincity.com/images/public/country/"; // New constant
const IMAGE_BASE_URL = "https://5bestincity.com/images/public/";
const BANNER_IMAGE_BASE_URL = `${IMAGE_BASE_URL}banner/`;
const BADGE_IMAGE_BASE_URL = `https://5bestincity.com/assets/img/badge/`;
const PROFILE_LINK = "app5bestincity://5bestincity.com/subMenuPage?pageUrl=https://liveapps.5bestincity.com";

const ENDPOINTS = {
  CITY: "city.php",
  CATEGORY: "category.php",
  PROFILE_DETAILS: "profile-details.php",
  LISTING_API: "listingapi.php",
  LOCATION_BY_SUBCATEGORY: "get_location_by_subcategory.php",
  BANNER_FETCH: "bannerfetchinfo.php",
  REVIEW_API: "reviewapi.php",
  REVIEW_API_MORE: "reviewapimore.php",
  TOGGLE_LIKE: "toggle_like.php",
  SUBMIT_REVIEW: "prev.php",
  UPDATE_REVIEW: "updateReview.php",
  COLLECTION_DETAILS: 'collectionsapi.php',
};

const getApiUrl = (endpoint, params = "") => `${API_BASE_URL}${endpoint}?${params}`;
const getImageUrl = (type, imageName) => {
  switch (type) {
    case "banner":
      return `${BANNER_IMAGE_BASE_URL}${imageName}`;
    case "country":
      return `${COUNTRY_IMAGE_BASE_URL}${imageName}`;
    case "category":
      return `${CATEGORY_IMAGE_BASE_URL}${imageName}`;
    case "searchEngine":
      return `${SEARCH_ENGINE_IMAGE_BASE_URL}${imageName.replace("../", "")}`;
    default:
      throw new Error(`Unknown image type: ${type}`);
  }
};

export {
  API_BASE_URL,
  IMAGE_BASE_URL,
  COUNTRY_IMAGE_BASE_URL,
  CATEGORY_IMAGE_BASE_URL,
  SEARCH_ENGINE_IMAGE_BASE_URL,
  ENDPOINTS,
  BADGE_IMAGE_BASE_URL,
  getApiUrl,
  getImageUrl,PROFILE_LINK,
  API_EASY_PROFILE_URL
};
