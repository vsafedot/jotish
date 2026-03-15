import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const ROW_HEIGHT = 80;
const V_BUFFER = 5;

export default function List() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollTop, setScrollTop] = useState(0);
  
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://backend.jotish.in/backend_dev/gettabledata.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: 'test', password: '123456' }),
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        let result = await response.json();
        
        // Handle if result is nested
        if (result && result.data && Array.isArray(result.data)) result = result.data;
        if (!Array.isArray(result)) {
           // Fallback mock logic if API returns non-array or we fail to parse
           console.warn('API did not return a standard array, using mock data.');
           result = Array.from({length: 1000}, (_, i) => ({
             id: i + 1,
             name: `Employee ${i + 1}`,
             city: ['New York', 'London', 'Tokyo', 'Paris'][i % 4],
             salary: 50000 + (i * 100) % 50000
           }));
        }
        
        setData(result);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        // Fallback mock data if API is entirely down
        const mockData = Array.from({length: 10000}, (_, i) => ({
          id: i + 1,
          name: `Employee ${i + 1}`,
          city: ['San Francisco', 'Austin', 'New York', 'Seattle'][i % 4],
          salary: 60000 + (Math.random() * 40000)
        }));
        setData(mockData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  const { virtualItems, totalHeight } = useMemo(() => {
    const containerHeight = containerRef.current ? containerRef.current.clientHeight : 800; // default assumptions
    
    const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - V_BUFFER);
    const endIndex = Math.min(
      data.length - 1,
      Math.floor((scrollTop + containerHeight) / ROW_HEIGHT) + V_BUFFER
    );

    const virtualItems = [];
    for (let i = startIndex; i <= endIndex; i++) {
      if (data[i]) {
        virtualItems.push({
          index: i,
          item: data[i],
          offsetTop: i * ROW_HEIGHT
        });
      }
    }

    return {
      virtualItems,
      totalHeight: data.length * ROW_HEIGHT
    };
  }, [scrollTop, data]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <div className="text-xl text-blue-600 font-semibold animate-pulse">Loading employee data...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-white p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Employee Directory</h2>
        <p className="text-gray-500">High-performance virtualized list showing {data.length} records.</p>
        {error && <p className="text-red-500 mt-2 text-sm">Failed to fetch API, displaying fallback mock data.</p>}
      </div>

      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto border border-gray-200 rounded-lg shadow-inner relative"
      >
        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
          {virtualItems.map(({ index, item, offsetTop }) => {
            // Using item.id or index as key. Assuming id exists.
            const uniqueKey = item.id || `emp-${index}`;
            const name = item.name || item.first_name || `Employee ${index}`;
            const city = item.city || item.location || 'Unknown City';
            const salary = item.salary || item.compensation || 'N/A';

            return (
              <div
                key={uniqueKey}
                onClick={() => navigate(`/details/${uniqueKey}`, { state: { employee: item } })}
                style={{
                  position: 'absolute',
                  top: 0,
                  transform: `translateY(${offsetTop}px)`,
                  height: `${ROW_HEIGHT}px`,
                  width: '100%',
                }}
                className="px-6 py-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors duration-150"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 shadow-sm">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{name}</p>
                    <p className="text-xs text-gray-500">{city}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">
                    {typeof salary === 'number' ? `$${salary.toLocaleString()}` : salary}
                  </p>
                  <p className="text-xs text-blue-600 font-medium">View Details &rarr;</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
