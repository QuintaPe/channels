import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function MatchModal({ selectedMatch, setSelectedMatch }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (selectedMatch) {
      setIsOpen(true);
    }
  }, [selectedMatch]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setSelectedMatch(null);
    }, 200); // Esperar a que termine la animación
  };

  if (!selectedMatch) return null;

  return createPortal(
    <div className={`absolute inset-0 z-[9999] bg-black/75 flex items-center justify-center transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div className="fixed inset-0" onClick={handleClose} />
      <div className={`relative z-10 w-full max-w-4xl p-6 bg-gradient-to-br from-card via-[#1a1d23] to-card text-white rounded-sm shadow-2xl overflow-auto max-h-[90vh] m-1 transition-all duration-200 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Detalles del Partido</h2>
            <p className="text-gray-400">{selectedMatch.league.name}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors duration-200 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Equipos y marcador */}
          <div className="space-y-4">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 hover:bg-gray-800/70 transition-all duration-200">
              <div className="flex items-center justify-between text-center">
                <div className="text-center flex-1 min-w-0">
                  <img
                    src={selectedMatch.teams.home.logo}
                    alt={selectedMatch.teams.home.name}
                    className="w-12 h-12 mx-auto mb-2 object-contain"
                  />
                  <p className="font-semibold truncate text-sm sm:text-base">{selectedMatch.teams.home.name}</p>
                </div>

                <div className="text-xl sm:text-3xl font-bold px-4 flex-1 min-w-0">
                  {selectedMatch.goals.home} - {selectedMatch.goals.away}
                </div>

                <div className="text-center flex-1 min-w-0">
                  <img
                    src={selectedMatch.teams.away.logo}
                    alt={selectedMatch.teams.away.name}
                    className="w-12 h-12 mx-auto mb-2 object-contain"
                  />
                  <p className="font-semibold truncate text-sm sm:text-base">{selectedMatch.teams.away.name}</p>
                </div>
              </div>
            </div>

            {/* Marcadores */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 hover:bg-gray-800/70 transition-all duration-200">
              <h3 className="text-xl font-semibold mb-3">Marcadores</h3>
              <div className="space-y-2 text-gray-300">
                <div className="flex justify-between">
                  <span>Primer Tiempo:</span>
                  <span className="font-medium">
                    {selectedMatch.score.halftime.home} - {selectedMatch.score.halftime.away}
                  </span>
                </div>
                {selectedMatch.score.fulltime.home !== null && (
                  <div className="flex justify-between">
                    <span>Final:</span>
                    <span className="font-medium">
                      {selectedMatch.score.fulltime.home} - {selectedMatch.score.fulltime.away}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 hover:bg-gray-800/70 transition-all duration-200">
            <h3 className="text-xl font-semibold text-white mb-3">Información del Partido</h3>
            <div className="space-y-3 text-gray-300">
              <p className="flex items-center gap-2">
                ⏱️ Minuto: {selectedMatch.fixture.status.elapsed}'
              </p>
              <p className="flex items-center gap-2">
                📍 Estado: {selectedMatch.fixture.status.long}
              </p>
              <p className="flex items-center gap-2">
                🏆 Liga: {selectedMatch.league.name}
              </p>
              <p className="flex items-center gap-2">
                🌍 País: {selectedMatch.league.country}
              </p>
              {selectedMatch.fixture.venue.name && (
                <p className="flex items-center gap-2">
                  🏟️ Estadio: {selectedMatch.fixture.venue.name}
                </p>
              )}
              {selectedMatch.fixture.referee && (
                <p className="flex items-center gap-2">
                  👨‍⚖️ Árbitro: {selectedMatch.fixture.referee}
                </p>
              )}
            </div>
          </div>
        </div>

        {selectedMatch.events.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 hover:bg-gray-800/70 transition-all duration-200 mt-4">
            <h3 className="text-xl font-semibold text-white mb-3">Eventos</h3>
            <div className="space-y-3 text-gray-300">
              {selectedMatch.events.map((event) => (
                <div key={event.time.elapsed} className="flex md:flex-row flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{event.time.elapsed}'</span>
                    {event.type === "Goal" && <span>⚽</span>}
                    {event.type === "Card" && event.detail === "Yellow Card" && <span>🟨</span>}
                    {event.type === "Card" && event.detail === "Red Card" && <span>🟥</span>}
                    {event.type === "subst" && <span>🔄</span>}
                    <span className="font-medium">{event.team.name}</span>
                  </div>
                  
                  {event.player.name && (
                    <div className="md:ml-8 text-yellow-200">
                      {event.type === "subst" ? "Sale:" : "Jugador:"} {event.player.name}
                    </div>
                  )}
                  
                  {event.assist.name && (
                    <div className="md:ml-8 text-gray-400">
                      {event.type === "Goal" ? "⤝ Asistencia:" : "⟶"} {event.assist.name}
                    </div>
                  )}
                  
                  {event.detail && event.type !== "Card" && (
                    <div className="md:ml-8 text-gray-400 italic">
                      {event.detail}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
