import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Card from '@/components/Card';
import MatchModal from '@/components/MatchModal';

export default function LiveMatches() {
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    const fetchLiveScores = async () => {
      try {
        const response = await fetch('/api/live');
        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }
        const data = await response.json();
        console.log(data);
        setLiveMatches(data.response);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los partidos');
        setLoading(false);
      }
    };

    fetchLiveScores();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando partidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {liveMatches.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No hay partidos en vivo en este momento.</p>
        ) : (
          liveMatches.map((match) => (
            <Card 
              key={match.fixture.id}
              onClick={() => setSelectedMatch(match)}
              className="cursor-pointer hover:bg-gray-800 transition-colors"
            >
              <div>
                <div className="flex justify-between mb-2">
                  <div>
                    <h2 className="text-lg font-semibold text-white truncate">{match.teams.home.name}</h2>
                    <h2 className="text-lg font-semibold text-white truncate">{match.teams.away.name}</h2>
                  </div>
                  <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded h-fit">
                    {match.goals.home} - {match.goals.away}
                  </span>
                </div>

                <div className="border-t border-gray-700 pt-3">
                  <ul className="space-y-1 text-sm text-gray-400">
                    <li>⚽ {match.league.name} - {match.league.country}</li>
                    <li>⏱️ Minuto: {match.fixture.status.elapsed}'</li>
                    <li>📍 Estado: {match.fixture.status.long}</li>
                  </ul>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {selectedMatch && (
        <MatchModal 
          selectedMatch={selectedMatch} 
          setSelectedMatch={setSelectedMatch} 
        />
      )}

    </>
  );
}
