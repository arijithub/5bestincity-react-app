const API_BASE_URL = "https://myapps.5bestincity.com/api/app-api-only/";
const API_BASE_URL_5best = "https://myapps.5bestincity.com/api/app-5best-api/";
const IMAGE_BASE_URL = "https://myapps.5bestincity.com/"; // Replace relative paths
const DEFAULT_IMAGE_BASE_URL = "https://myapps.5bestincity.com/images/Web-Icon.png";
const DEFAULT_IMAGE_COLLECTION_URL = "https://myapps.5bestincity.com/images/Web-Icon.png";
const DEFAULT_IMAGE_AMAZON_URL = "https://myapps.5bestincity.com/images/shop-cart.jpg";
const VIEW_MORE_LINK = "app5bestincity://5bestincity.com/subMenuPage?pageUrl=https://liveapps.5bestincity.com";

const COLORS = {
  primary: "#3B82F6",
  accent2: "#4D39D2C0",
  default: "#fff",
};

const getEngineImageUrl = (relativePath) => relativePath.replace("../", IMAGE_BASE_URL);

const ENDPOINTS = {
  WEB_APPS: "webappsapi.php",
   CATEGORY_PAGE: "webcatsapi.php",
     NEAR_ME: "nearmejson.php",
	  AMAZON_API: "amazonapi.php", // Add this line
	   AMAZON_FILTER : "amazonfilter.php",
	     COLLECTIONS: "collectionsapi.php",
			  COLLECTIONS_FILTER: "collectionsfilter.php",
			  UPDATE_COUNT: "update_count.php",
			  SEARCH_ENGINES: "collectionsapi.php", // If needed
			  GET_COUNTS : "get_counts.php",
			  COLLECTIONS_DETAILS: "collectionsdetails.php"
};

const getApiUrl = (endpoint, params = "") => `${API_BASE_URL}${endpoint}?${params}`;

const getApiUrlfilter = (endpoint, params = "") => `${API_BASE_URL}${endpoint}${params}`;

const API_ENDPOINTS = {
  GET_COUNTS: `${API_BASE_URL}get_counts.php`,
  UPDATE_COUNT: `${API_BASE_URL}update_count.php`,
  COLLECTIONS: `${API_BASE_URL}collectionsapi.php`,
  COLLECTIONS_FILTER: `${API_BASE_URL}collectionsfilter.php`,
  AMAZON: `${API_BASE_URL}amazonapi.php`,
  WEB_APPS: `${API_BASE_URL}webappsapi.php`,
  BUSINESS_DETAILS: `${API_BASE_URL_5best}profile-details.php`,
  FEATURED_BIZ: `${API_BASE_URL_5best}featured_biz.php`
};


export {
  API_BASE_URL,
  API_BASE_URL_5best,
  IMAGE_BASE_URL,
  DEFAULT_IMAGE_BASE_URL,
  ENDPOINTS,
  API_ENDPOINTS,
  getApiUrl,getApiUrlfilter,
  COLORS, getEngineImageUrl,DEFAULT_IMAGE_COLLECTION_URL,VIEW_MORE_LINK,DEFAULT_IMAGE_AMAZON_URL
};
