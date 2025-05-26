import { useState, useMemo, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SearchChannels() {
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState({ groups: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/stream');
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
    return data.groups.map(group => {
      const filteredStations = group.stations.filter(station =>
        station.name.toLowerCase().includes(lowerSearch)
      );
      return { ...group, stations: filteredStations };
    }).filter(group => group.stations.length > 0);
  }, [searchTerm, data]);

  if (loading) {
    return <div className="text-center p-4">Cargando...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Input
        type="text"
        placeholder="Buscar canales..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6"
      />

      {filteredGroups.length === 0 ? (
        <p className="text-center text-muted-foreground">No se encontraron canales.</p>
      ) : (
        filteredGroups.map(group => (
          <Card key={group.name} className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-4">
                <img src={group.image} alt={group.name} className="w-10 h-10 rounded-lg" />
                <span>{group.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {group.stations.map(station => (
                    <Card key={station.name} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <img src={station.image} alt={station.name} className="w-full h-32 object-contain mb-3 rounded-md" />
                        <h3 className="font-semibold text-lg mb-2">{station.name}</h3>
                        <a 
                          href={station.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:text-blue-600 hover:underline break-all"
                        >
                          {station.url}
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
