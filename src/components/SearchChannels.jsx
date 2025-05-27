import { useState, useMemo, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import Card from "@/components/Card";

export default function SearchChannels({ url }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState({ groups: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/stream?url=${encodeURIComponent(url)}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredGroups = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    
    // Handle both single group and groups array cases
    if (data.groups) {
      return data.groups.map(group => {
        const filteredStations = group.stations.filter(station =>
          station.name.toLowerCase().replace(/\s+/g, '').includes(lowerSearch.replace(/\s+/g, ''))
        );
        return { ...group, stations: filteredStations };
      }).filter(group => group.stations.length > 0);
    } else {
      const filteredStations = data.stations?.filter(station =>
        station.name.toLowerCase().replace(/\s+/g, '').includes(lowerSearch.replace(/\s+/g, ''))
      ) || [];
      return [{...data, stations: filteredStations}];
    }
  }, [searchTerm, data]);

  if (loading) {
    return <div className="text-center p-4">Cargando...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <>
        <Input
          type="text"
          placeholder="Buscar canales..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-8 bg-[#1E1E1E]"
        />

        {filteredGroups.map(group => (
          <div key={group.name + searchTerm} className="mb-16">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-yellow-200">{group.name}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {group.stations.map(station => (
                <Card 
                  key={station.name + station.url} 
                  onClick={() => window.open(station.url, '_blank')}
                >
                  <div>
                    <div className="flex justify-center items-center relative mb-3">
                      {station.image && (
                        <img src={station.image} alt={station.name} className="h-16 object-contain" 
                        style={{ borderRadius: '10px' }} 
                        />
                      )}
                    </div>
                    <h3 className="text-center font-semibold mb-2 text-xl">{station.name}</h3>
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-center text-[10px] font-mono text-gray-500 break-all">
                        {station.url}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {filteredGroups.length === 0 && (
          <p className="text-center text-gray-400">No se encontraron canales.</p>
        )}
      </>
  );
}
