import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { debounce } from 'lodash';
import Banner from './components/nearme/Banner';
import SearchEngineSection from './components/searchengine/SearchEngineSection';
import CategorySection from './components/nearme/CategorySection';
import LinksSection from './components/nearme/LinksSection';
import FooterComponent from './FooterComponent';
import { getApiUrl, IMAGE_BASE_URL, DEFAULT_IMAGE_URL, ENDPOINTS } from './config/apiConfigext';
import {
  colors
} from './theme-styles';
import MetaData from './components/MetaData';
 
 

const NearMePage = () => {
  const [data, setData] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchClicked, setIsSearchClicked] = useState(true);
  const [isCategorySticky, setIsCategorySticky] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [selectedEngines, setSelectedEngines] = useState([]);
  const [showEngines, setShowEngines] = useState(false);
  const sectionRefs = useRef({});
  const isManuallyScrolling = useRef(false);
  const scrollTimeout = useRef(null);
  const searchBoxRef = useRef(null);
  const categorySectionRef = useRef(null);
  const bannerRef = useRef(null);
  const lastScrollPosition = useRef(0);
  const clickedCategory = useRef(null);
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const bannerShowTimeout = useRef(null);

  useEffect(() => {
    fetch(getApiUrl(ENDPOINTS.NEAR_ME))
      .then((response) => response.json())
      .then((json) => {
        const uniqueCategories = [...new Map(
          json.subcatdata.map(item => [item['subcat_id'], item])
        ).values()];

        const uniqueLinkData = json.linkdata.map(category => ({
          ...category,
          links: [...new Map(
            category.links.map(link => [link['link_id'], link])
          ).values()]
        }));

        const initialSelectedEngines = json.searchengine.searchenginedata.map(engine => ({
          ...engine,
          selected: engine.selected === "true",
        }));

        setData({
          ...json,
          subcatdata: uniqueCategories,
          linkdata: uniqueLinkData,
          searchengine: { searchenginedata: initialSelectedEngines },
        });

        setSelectedEngines(initialSelectedEngines);
		 setIsLoading(false);
      })
      .catch((error) => console.error('Error fetching data:', error));
	   setIsLoading(false);  // Ensure loading is set to false even on error
  }, []);
  
const isMobileDevice = () => window.innerWidth <= 768;

const smoothScrollTo = (targetPosition, duration = isMobileDevice() ? 500 : 1000) => {
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  const animation = (currentTime) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);

    // Enhanced easing for mobile
    const easing = t => t < 0.5 
      ? 4 * t * t * t 
      : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

    const currentPosition = startPosition + distance * easing(progress);
    window.scrollTo(0, currentPosition);

    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  };

  requestAnimationFrame(animation);
};

const scrollToSection = useCallback((categoryName) => {
  if (categoryName === 'All') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const section = sectionRefs.current[categoryName];
  if (!section) return;

  const isMobile = window.innerWidth <= 768;
  const headerHeight = (searchBoxRef.current?.offsetHeight || 0) + 
                      (categorySectionRef.current?.offsetHeight || 0);
  
  const sectionRect = section.getBoundingClientRect();
  const additionalMargin = 40;  // Adjust this value as needed for more space
  const targetPosition = window.pageYOffset + sectionRect.top - headerHeight - additionalMargin;

  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  }); 
}, []);




const handleCategoryClick = useCallback((categoryName) => {
  if (clickedCategory.current === categoryName) return;
  
  // Set flags immediately
  clickedCategory.current = categoryName;
  isManuallyScrolling.current = true;
  const isMobile = window.innerWidth <= 768;

  // Disable scroll updates temporarily
  const disableScrollUpdate = () => {
    isManuallyScrolling.current = true;
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
  };

  // Enable scroll updates after animation
  const enableScrollUpdate = () => {
    scrollTimeout.current = setTimeout(() => {
      isManuallyScrolling.current = false;
      clickedCategory.current = null;
    }, isMobile ? 800 : 1000);
  };

  // Execute click handling
  disableScrollUpdate();
  setActiveCategory(categoryName);  // Update active category immediately

  requestAnimationFrame(() => {
    scrollToSection(categoryName);
    enableScrollUpdate();
  });
}, [scrollToSection]);
  
  

 const scrollToSearchResults = useCallback(() => {
  if (!categorySectionRef.current) return;
  
  const headerHeight = (searchBoxRef.current?.offsetHeight || 0) + 
                      (categorySectionRef.current?.offsetHeight || 0);
  
  // Increase the offset to scroll higher up (e.g., from 10px to 80px)
  const offset = 80;
  
  // Calculate the target scroll position
  const targetPosition = Math.max(0, headerHeight - offset);
  
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
}, []);

const handleSearch = useCallback((query) => {
  setSearchQuery(query.toLowerCase());
  setActiveCategory('All');
  
  // Filter the links first
  const filtered = data?.linkdata
    .map(category => ({
      ...category,
      links: category.links.filter(link =>
        link.link_name.toLowerCase().includes(query.toLowerCase()) ||
        category.sub_category_name.toLowerCase().includes(query.toLowerCase())
      )
    }))
    .filter(category => category.links.length > 0);

  // Get the categories that have matching links
  const matchingCategories = filtered.map(cat => ({
    subcat_id: cat.subcat_id,
    sub_category_name: cat.sub_category_name,
    category_image: data.subcatdata.find(sc => sc.subcat_id === cat.subcat_id)?.category_image
  }));

  // Always include 'All' category
  const allCategory = { subcat_id: 'all', sub_category_name: 'All' };
  setFilteredCategories([allCategory, ...matchingCategories]);

  setShowEngines(query.trim() !== '' && (!filtered || filtered.length === 0));

  // If there are search results, scroll to position them below the sticky header
  if (query.trim() !== '' && filtered.length > 0) {
    // Small delay to ensure DOM has updated
    setTimeout(scrollToSearchResults, 100);
  }
}, [data, scrollToSearchResults]);

  const handleSearchClick = () => {
 setIsSearchClicked(true);
  setIsBannerVisible(false);
  };

const handleClearSearch = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setSearchQuery('');
  setShowEngines(false);
  
  setTimeout(() => {
    setIsBannerVisible(true);
  }, 100);
};

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      let query = searchQuery.trim();
      if (query) {
        let searchUrls = selectedEngines
          .filter(engine => engine.selected)
          .map(engine => `${engine.searchengineurl}${query}`)
          .join('/~');
        if (searchUrls) {
          window.open('collections:'+searchUrls, '_blank');
        }
      }
    }
  };

  const handleEngineSelection = (selectedEngine) => {
    setSelectedEngines(prevEngines =>
      prevEngines.map(engine =>
        engine.searchenginename === selectedEngine.searchenginename
          ? { ...engine, selected: !engine.selected }
          : engine
      )
    );
  };

  const filteredLinkData = data?.linkdata
    ? data.linkdata
        .map(category => {
          const lowercaseQuery = searchQuery.toLowerCase();
          const categoryMatches = category.sub_category_name.toLowerCase().includes(lowercaseQuery);

          return {
            ...category,
            links: category.links.filter(link =>
              link.link_name.toLowerCase().includes(lowercaseQuery) || categoryMatches
            )
          };
        })
        .filter(category => category.links.length > 0)
    : [];

const updateActiveCategory = useCallback(() => {
  if (isManuallyScrolling.current || clickedCategory.current) return;

  const viewportMiddle = window.innerHeight / 2;
  const scrollPosition = window.scrollY + viewportMiddle;
  const scrollThreshold = 50; // Minimum scroll distance to trigger update

  // Special handling for top section
  if (window.scrollY < scrollThreshold) {
    setActiveCategory('All');
    return;
  }

  let newActiveCategory = null;
  let smallestDistance = Infinity;

  // More precise section detection
  Object.entries(sectionRefs.current).forEach(([categoryName, ref]) => {
    if (!ref) return;

    const rect = ref.getBoundingClientRect();
    const sectionMiddle = rect.top + (rect.height / 2);
    const distance = Math.abs(viewportMiddle - sectionMiddle);

    // Only consider sections that are partly in viewport
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      if (distance < smallestDistance) {
        smallestDistance = distance;
        newActiveCategory = categoryName;
      }
    }
  });

  // Only update if we found a valid category and it's different
  if (newActiveCategory && newActiveCategory !== activeCategory) {
    setActiveCategory(newActiveCategory);
  }
}, [activeCategory]);

const handleScroll = useCallback(() => {
  if (!categorySectionRef.current || !bannerRef.current) return;

  // Use requestAnimationFrame for smoother mobile scrolling
  requestAnimationFrame(() => {
    const scrollPosition = window.scrollY;
    const scrollDelta = Math.abs(scrollPosition - lastScrollPosition.current);
    
    // Ignore small scroll changes on mobile
    if (isMobileDevice() && scrollDelta < 3) return;

    const categorySectionTop = categorySectionRef.current.getBoundingClientRect().top;
    const bannerHeight = bannerRef.current.getBoundingClientRect().height;
    const searchHeight = isSearchClicked ? 60 : 0;
    
    // Add extra threshold for mobile
    const mobileThreshold = isMobileDevice() ? 10 : 0;
    const threshold = bannerHeight + searchHeight + mobileThreshold;

    // Check if scrolling down
    if (scrollPosition > lastScrollPosition.current) {
      setIsCategorySticky(categorySectionTop <= 0);
      setIsBannerVisible(false);
    } 
    // Check if scrolling up to the very top
    else if (scrollPosition === 0) {
      setIsBannerVisible(true);
      setIsCategorySticky(false);
    }
    // Regular scroll up but not at top
    else if (scrollPosition < lastScrollPosition.current) {
      setIsCategorySticky(categorySectionTop <= 0);
    }

    lastScrollPosition.current = scrollPosition;

    if (!isManuallyScrolling.current && !clickedCategory.current) {
      debouncedUpdateActiveCategory();
    }
  });
}, [isSearchClicked]);

  const debouncedUpdateActiveCategory = useCallback(
    debounce(updateActiveCategory, 100),
    [updateActiveCategory]
  );
  
 
useEffect(() => {
  let scrollEndTimeout;
  const handleScroll = () => {
    if (isManuallyScrolling.current || clickedCategory.current) return;

    // Clear existing timeout
    if (scrollEndTimeout) {
      clearTimeout(scrollEndTimeout);
    }

    // Set new timeout
    scrollEndTimeout = setTimeout(() => {
      if (!isManuallyScrolling.current && !clickedCategory.current) {
        updateActiveCategory();
      }
    }, 50); // Small delay to wait for scroll to settle
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => {
    window.removeEventListener('scroll', handleScroll);
    if (scrollEndTimeout) {
      clearTimeout(scrollEndTimeout);
    }
  };
}, [updateActiveCategory]);

useEffect(() => {
  const handleBackButton = (event) => {
    if (searchQuery) {
      // Prevent the default back navigation behavior
      event.preventDefault();

      // Clear the search and reset the page state
      handleClearSearch();
    }
  };

  // Add popstate listener to handle browser back button
  window.addEventListener('popstate', handleBackButton);

  // Push a dummy history state to prevent a hard refresh
  window.history.pushState(null, '', window.location.pathname);

  // Cleanup listener on component unmount
  return () => {
    window.removeEventListener('popstate', handleBackButton);
  };
}, [searchQuery, handleClearSearch]);


  if (!data) {
    return <Typography sx={{ textAlign: 'center', mt: 4 }}>Loading...</Typography>;
  }

return (
  <Container ref={containerRef} sx={{ 
    background: colors.app_primaryBackground,
    maxWidth: '100% !important',  
    minHeight: '100vh', 
   
  }}>
  <MetaData component="NearMePage" />
    <Box 
      ref={searchBoxRef}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        backgroundColor: 'white',
        transition: 'all 0.3s ease-in-out',
        paddingTop: '10px',
        paddingBottom: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '16px',
      }}
    >
      <SearchEngineSection 
        onSearch={handleSearch} 
        onClick={handleSearchClick} 
        onClear={handleClearSearch}
        onKeyDown={handleSearchKeyDown}
        onEngineSelect={handleEngineSelection}
        isSticky={true} 
        searchEngines={selectedEngines}
        showEngines={showEngines}
        searchValue={searchQuery}
      />
    </Box>
    <Box 
      ref={bannerRef}
      sx={{
        display: isBannerVisible ? 'block' : 'none',
        opacity: isBannerVisible ? 1 : 0,
        maxHeight: isBannerVisible ? '1000px' : '0',
        overflow: isBannerVisible ? 'visible' : 'hidden',
        transition: 'opacity 0.3s ease-in-out, max-height 0.3s ease-in-out',
        marginBottom: isBannerVisible ? '16px' : '0'
      }}
    >
      <Banner banners={data.banner} />
    </Box>
    {!showEngines && (
      <Box 
        ref={categorySectionRef}
        sx={{
          position: 'sticky',
          top: '58px',
          zIndex: 1090,
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <CategorySection
          categories={searchQuery ? filteredCategories : [{ subcat_id: 'all', sub_category_name: 'All' }, ...data.subcatdata]}
          onCategoryClick={handleCategoryClick}
          activeCategory={activeCategory}
          isSticky={isCategorySticky}
          isSearchClicked={true}
          isLoading={isLoading}
        />
      </Box>
    )}
    {showEngines ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        {selectedEngines.map(engine => (
          <Box key={engine.searchenginename} sx={{ textAlign: 'center', mx: 2 }}>
            {/* Add content for search engines here if needed */}
          </Box>
        ))}
      </Box>
    ) : (
      <LinksSection
        linkData={filteredLinkData}
        activeCategory={activeCategory}
        sectionRefs={sectionRefs}
        sx={{
          marginTop: '16px'
        }}
      />
    )}
	
	 <FooterComponent />
  </Container>
);
};

export default NearMePage;