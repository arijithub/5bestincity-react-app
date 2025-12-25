import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { debounce } from 'lodash';
import { useParams } from 'react-router-dom';
import Banner from '../nearme/Banner';
import SearchEngineSection from '../searchengine/SearchEngineSection';
import CategorySection from './CategorySection';
import LinksSection from '../webapp/LinksSection';
import FooterComponent from '../../FooterComponent';
import { getApiUrl, ENDPOINTS } from '../../config/apiConfigext';
import { colors } from '../../theme-styles';
import MetaData from '../../components/MetaData';
import { getRecentlyViewed, getMostViewed } from '../../utils/linkDatabase';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [data, setData] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchClicked, setIsSearchClicked] = useState(true);
  const [isCategorySticky, setIsCategorySticky] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [selectedEngines, setSelectedEngines] = useState([]);
  const [showEngines, setShowEngines] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filteredLinkData, setFilteredLinkData] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [mostViewed, setMostViewed] = useState([]);

  // Refs
  const sectionRefs = useRef({});
  const isManuallyScrolling = useRef(false);
  const scrollTimeout = useRef(null);
  const searchBoxRef = useRef(null);
  const categorySectionRef = useRef(null);
  const bannerRef = useRef(null);
  const lastScrollPosition = useRef(0);
  const clickedCategory = useRef(null);
  const containerRef = useRef(null);
  const lastClickTime = useRef(0);
  
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Set flag when leaving the page (including hardware back button)
      sessionStorage.setItem('isReturningToWebApps', 'true');
    };

    // Add event listener for page unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Add event listener for hardware back button
    window.addEventListener('popstate', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleBeforeUnload);
    };
  }, []);

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

  const debouncedUpdateActiveCategory = useCallback(
    debounce(updateActiveCategory, 100),
    [updateActiveCategory]
  );

  useEffect(() => {
    fetch(getApiUrl(ENDPOINTS.CATEGORY_PAGE, `catid=${categoryId}`))
      .then((response) => response.json())
      .then((json) => {
        const uniqueLinkData = json.linkdata.filter(category => 
          category.links && category.links.length > 0
        );

        const initialSelectedEngines = json.searchengine.searchenginedata.map(engine => ({
          ...engine,
          selected: engine.selected === "true",
        }));

        setData({
          ...json,
          linkdata: uniqueLinkData,
          searchengine: { searchenginedata: initialSelectedEngines },
        });
		
		  const subcategories = json.linkdata || [];
          const totalLinks = subcategories.reduce((total, cat) => 
          total + (cat.links?.length || 0), 0);
        
      setCategoryInfo({
        category_name: json.category_name || 'Web Tools',
        subcategories: subcategories,
        linkCount: totalLinks
      });

        setSelectedEngines(initialSelectedEngines);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      });
  }, [categoryId]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px',
      threshold: [0.5],
    };

    const observer = new IntersectionObserver((entries) => {
      if (isManuallyScrolling.current || Date.now() - lastScrollPosition.current < 1000) {
        return;
      }

      const mostVisible = entries.reduce((prev, current) => {
        return (prev?.intersectionRatio || 0) > current.intersectionRatio ? prev : current;
      }, null);

      if (mostVisible && mostVisible.isIntersecting) {
        const categoryName = mostVisible.target.getAttribute('data-category');
        
        setTimeout(() => {
          setActiveCategory(categoryName);
          
          const section = sectionRefs.current[categoryName];
          if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 200);
      }
    }, observerOptions);

    Object.entries(sectionRefs.current).forEach(([categoryName, element]) => {
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!categorySectionRef.current || !bannerRef.current) return;

      const scrollPosition = window.scrollY;
      const categorySectionTop = categorySectionRef.current.getBoundingClientRect().top;
      const bannerHeight = bannerRef.current.getBoundingClientRect().height;
      const searchHeight = isSearchClicked ? 60 : 0;
      const threshold = bannerHeight + searchHeight;

      // More stable sticky behavior
      if (!searchQuery) {
        if (scrollPosition > threshold) {
          setIsCategorySticky(true);
          setIsBannerVisible(false);
        } else {
          setIsCategorySticky(false);
          setIsBannerVisible(true);
        }
      }

      lastScrollPosition.current = scrollPosition;

      if (!isManuallyScrolling.current && !clickedCategory.current) {
        debouncedUpdateActiveCategory();
      }
    };

    // Use passive scroll listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSearchClicked, searchQuery, debouncedUpdateActiveCategory]);

  useEffect(() => {
    if (searchQuery && categorySectionRef.current && filteredLinkData) {
      const searchBoxHeight = searchBoxRef.current?.offsetHeight || 0;
      const categoryHeight = categorySectionRef.current?.offsetHeight || 0;
      const totalStickyHeight = searchBoxHeight + categoryHeight;

      // Small delay to ensure DOM is updated
      setTimeout(() => {
        const searchResultsContainer = document.querySelector('[data-search-results]');
        if (!searchResultsContainer) return;

        const searchResultsRect = searchResultsContainer.getBoundingClientRect();
        const currentScrollPosition = window.pageYOffset;
        const searchResultsTop = searchResultsRect.top + currentScrollPosition;

        // Calculate scroll position
        const scrollTo = searchResultsTop - totalStickyHeight - 16;

        window.scrollTo({
          top: Math.max(0, scrollTo), // Ensure we don't scroll past the top
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [searchQuery, filteredLinkData]);

  const isMobileDevice = () => window.innerWidth <= 768;

  const smoothScrollTo = (targetPosition, duration = isMobileDevice() ? 500 : 1000) => {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

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

  const calculateHeaderHeight = useCallback(() => {
    const searchBoxHeight = searchBoxRef.current?.offsetHeight || 0;
    const categoryHeight = categorySectionRef.current?.offsetHeight || 0;
    const bannerHeight = isBannerVisible ? (bannerRef.current?.offsetHeight || 0) : 0;
    return searchBoxHeight + categoryHeight + bannerHeight;
  }, [isBannerVisible]);

  const scrollToSection = useCallback((categoryName) => {
    // Disable any ongoing scroll observations temporarily
    isManuallyScrolling.current = true;
    
    // Calculate the complete header height
    const totalHeaderHeight = calculateHeaderHeight();
    const safetyMargin = 34; // Additional safety margin

    if (categoryName === 'All') {
      window.scrollTo({ 
        top: 0,
        behavior: 'smooth' 
      });
      setIsBannerVisible(true);
      return;
    }

    // Hide banner when scrolling to specific category
    setIsBannerVisible(false);

    const section = sectionRefs.current[categoryName];
    if (!section) return;

    // Get section position relative to viewport
    const sectionRect = section.getBoundingClientRect();
    const currentScrollPosition = window.pageYOffset;
    
    // Calculate target scroll position with extra padding
    const targetScrollPosition = currentScrollPosition + 
                               sectionRect.top - 
                               totalHeaderHeight - 
                               safetyMargin;

    // Smooth scroll to target
    window.scrollTo({
      top: targetScrollPosition,
      behavior: 'smooth'
    });

    // Reset scroll observation after animation
    setTimeout(() => {
      isManuallyScrolling.current = false;
      clickedCategory.current = null;
    }, 1000);
  }, [calculateHeaderHeight]);


const handleCategoryClick = useCallback((categoryName) => {
    if (clickedCategory.current === categoryName) return;
    
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    clickedCategory.current = categoryName;
    isManuallyScrolling.current = true;
    lastClickTime.current = Date.now();
    
    const disableScrollUpdate = () => {
      isManuallyScrolling.current = true;
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };

    const enableScrollUpdate = () => {
      scrollTimeout.current = setTimeout(() => {
        isManuallyScrolling.current = false;
        clickedCategory.current = null;
      }, 1500);
    };

    disableScrollUpdate();
    setActiveCategory(categoryName);

    if (categoryName !== 'All') {
      setIsBannerVisible(false);
    }

    requestAnimationFrame(() => {
      if (categoryName === 'All') {
        window.scrollTo({ 
          top: 0,
          behavior: 'smooth' 
        });
        setIsBannerVisible(true);
      } else {
        const section = sectionRefs.current[categoryName];
        if (section) {
          const searchBoxHeight = searchBoxRef.current?.offsetHeight || 0;
          const categoryHeight = categorySectionRef.current?.offsetHeight || 0;
          const offset = searchBoxHeight + categoryHeight + 60; // Increased padding from 20 to 60

          const sectionRect = section.getBoundingClientRect();
          const targetPosition = window.pageYOffset + sectionRect.top - offset;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
      enableScrollUpdate();
    });
}, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query.toLowerCase());
    setActiveCategory('All');
    setIsBannerVisible(false);
    
    if (!data?.linkdata) return;
    
    const filtered = data.linkdata
      .map(category => ({
        ...category,
        links: category.links.filter(link =>
          link.link_name.toLowerCase().includes(query.toLowerCase()) ||
          category.sub_category_name.toLowerCase().includes(query.toLowerCase())
        )
      }))
      .filter(category => category.links.length > 0);

    setFilteredLinkData(filtered);

    const matchingCategories = filtered.map(cat => ({
      subcat_id: cat.subcat_id,
      sub_category_name: cat.sub_category_name,
      sub_category_image: cat.sub_category_image
    }));

    const allCategory = { 
      subcat_id: 'all', 
      sub_category_name: 'All',
      sub_category_image: ''
    };
    
    setFilteredCategories([allCategory, ...matchingCategories]);
    setShowEngines(query.trim() !== '' && (!filtered || filtered.length === 0));
  }, [data]);

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

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    if (!data?.banner || data.banner.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => 
        prevIndex === data.banner.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [data?.banner]);
  
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

  useEffect(() => {
    const loadViewedLinks = async () => {
      try {
        const [recent, most] = await Promise.all([
          getRecentlyViewed(),
          getMostViewed()
        ]);
        setRecentlyViewed(recent);
        setMostViewed(most);
      } catch (error) {
        console.error('Error loading viewed links:', error);
      }
    };
    loadViewedLinks();
  }, []);

  if (!data) {
    return <Typography sx={{ textAlign: 'center', mt: 4 }}>Loading...</Typography>;
  }

  return (
    <Container ref={containerRef} sx={{ background: colors.app_primaryBackground, minHeight: '100vh'}}>
	  <MetaData 
      component="WebCategoryPage"
      pageInfo={categoryInfo} // Pass category info
    />
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
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          marginBottom: isBannerVisible ? '16px' : '0',
          position: 'relative',
          zIndex: 1
        }}
      >
        <Banner 
          banners={data.banner} 
          currentIndex={currentBannerIndex}
          onChangeIndex={setCurrentBannerIndex}
          autoPlay={true}
          interval={5000}
        />
      </Box>

      {!showEngines && (
        <Box 
          ref={categorySectionRef}
          sx={{
            position: 'sticky',
            top: '52px',
            zIndex: 1090,
           
            display: 'block',
            opacity: 1,
            visibility: 'visible',
            boxShadow: isCategorySticky ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
            width: '100%',
            transform: isCategorySticky ? 'translateY(0)' : 'none',
            transition: 'box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out',
            marginBottom: searchQuery ? '16px' : '0',
            padding: '8px 0',
          }}
        >
          <CategorySection
            categories={searchQuery ? filteredCategories : [{ subcat_id: 'all', sub_category_name: 'All' }, ...data.linkdata]}
            onCategoryClick={handleCategoryClick}
            activeCategory={activeCategory}
            isSticky={isCategorySticky}
            isSearchClicked={true}
            isLoading={isLoading}
            setRecentlyViewed={setRecentlyViewed}
            setMostViewed={setMostViewed}
          />
        </Box>
      )}

      {/* Search Results Section */}
      {searchQuery ? (
        <Box 
          data-search-results
          sx={{ 
            mt: 8,
            position: 'relative',
            zIndex: 1,
            paddingTop: '96px',
            scrollMarginTop: `${searchBoxRef.current?.offsetHeight + categorySectionRef.current?.offsetHeight + 32}px`,
            backgroundColor: 'transparent',
          }}
        >
          {filteredLinkData.length > 0 ? (
            <LinksSection
              linkData={filteredLinkData}
              activeCategory={activeCategory}
              sectionRefs={sectionRefs}
              setRecentlyViewed={setRecentlyViewed}
              setMostViewed={setMostViewed}
              onSectionVisible={(categoryName) => {
                if (!isManuallyScrolling.current) {
                  setActiveCategory(categoryName);
                }
              }}
              sx={{
                '& > div': {
                  position: 'relative',
                  scrollMarginTop: '200px',
                  marginBottom: '24px',
                  marginTop: '24px',
                  '&:first-of-type': {
                    marginTop: '32px',
                  }
                }
              }}
            />
          ) : (
         <Box></Box>
          )}
        </Box>
      ) : !showEngines && data?.linkdata ? (
        <LinksSection
          linkData={data.linkdata}
          activeCategory={activeCategory}
          sectionRefs={sectionRefs}
          setRecentlyViewed={setRecentlyViewed}
          setMostViewed={setMostViewed}
          onSectionVisible={(categoryName) => {
            if (!isManuallyScrolling.current) {
              setActiveCategory(categoryName);
            }
          }}
          sx={{
            position: 'relative',
            zIndex: 1,
            '& > div': {
              scrollMarginTop: '160px',
              marginTop: 0,
              marginBottom: '24px',
              '&:first-of-type': {
                marginTop: '20px',
              }
            }
          }}
        />
      ) : showEngines ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          {selectedEngines.map(engine => (
            <Box key={engine.searchenginename} sx={{ textAlign: 'center', mx: 2 }}>
              {/* Add content for search engines here if needed */}
            </Box>
          ))}
        </Box>
      ) : null}

      <FooterComponent />
    </Container>
  );
};

export default CategoryPage;