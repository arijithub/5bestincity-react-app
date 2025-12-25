import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import metaConfig from '../config/metaConfig';
import { generateMetaContent,generateCollectionMeta,generateWebCategoryMeta } from '../config/metaConfig';

const MetaData = ({ 
  component = 'HomePage', 
  customTitle, 
  customDescription,
  cityInfo,
  pageInfo,
  profileData,
  collectionData 
}) => {
  const getMetadata = () => {
    let metadata;
    
    switch (component) {
      case 'HomePage':
        metadata = metaConfig.home;
        break;
       case 'ListingPage':
        metadata = metaConfig.listing;
        if (pageInfo) {
          metadata = generateMetaContent(metadata, {
            city_name: pageInfo.cityName,
            state_name: pageInfo.stateName,
            subcategory_name: pageInfo.subcatName
          });
        }
        break;
      case 'CityPage':
        metadata = metaConfig.city;
        break;
       case 'ProfilePage':
        metadata = metaConfig.profile;
        if (profileData?.listdata) {
          metadata = generateMetaContent(metadata, {
            business_name: profileData.listdata.business_name,
            city_name: profileData.listdata.city_name,
            state_name: profileData.listdata.state_name,
            subcategory_name: profileData.listdata.sub_category_name
          });
        }
        break;
		 case 'CollectionDetails':
        metadata = metaConfig.collections;
        if (collectionData) {
          const { collection, creator } = collectionData;
          const validItems = Object.keys(collection)
            .filter(key => key.startsWith('item') && collection[key])
            .length;
            
          metadata = generateCollectionMeta(metadata, {
            collection_title: collection.title,
            creator_name: creator.name,
            categories: collection.categories,
            description: collection.description,
            item_count: validItems
          });
        }
        break;
      case 'CategoryHome':
        metadata = metaConfig.category;
        if (cityInfo) {
          metadata = generateMetaContent(metadata, cityInfo);
        }
        break;
      case 'CollectionsPage':
        metadata = metaConfig.collections;
        break;
      case 'PinnedBusinesses':
        metadata = metaConfig.pinnedBusinesses;
        break;
      case 'WebAppsPage':
        metadata = metaConfig.webApps;
        break;
      case 'NearMePage':
        metadata = metaConfig.nearMe;
        break;
      // In MetaData.js, add the case for WebCategoryPage
		case 'WebCategoryPage':
		  metadata = metaConfig.webCategory;
		  if (pageInfo) {
			metadata = generateWebCategoryMeta(metadata, pageInfo);
		  }
		  break;
      case 'PinnedCollections':
        metadata = metaConfig.pinnedCollections;
        break;
      case 'ShareCollections':
        metadata = metaConfig.shareCollections;
        break;
      case 'ViewSharedCollections':
        metadata = metaConfig.viewSharedCollections;
        break;
      case 'DeleteInfo':
        metadata = metaConfig.deleteInfo;
        break;
      case 'ProductsPage':
        metadata = metaConfig.amazon;
        break;
      default:
        metadata = metaConfig.home; // default fallback
    }

    return metadata;
  };

  const metadata = getMetadata();

  // Allow custom overrides while falling back to config values
  const title = customTitle || metadata.title;
  const metaTitle = customTitle || metadata.metaTitle;
  const metaDescription = customDescription || metadata.metaDescription;

  useEffect(() => {
    document.title = metaTitle || title;
  }, [title, metaTitle]);

  return (
    <Helmet>
      <title>{metaTitle || title}</title>
      <meta name="title" content={metaTitle || title} />
      <meta name="description" content={metaDescription} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={metaTitle || title} />
      <meta property="og:description" content={metaDescription} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={metaTitle || title} />
      <meta property="twitter:description" content={metaDescription} />
    </Helmet>
  );
};

export default MetaData; 