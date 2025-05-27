import { useEffect, useState } from 'react';
import  Card  from '@/components/Card';
import { Input } from '@/components/ui/input';

interface Canal {
  nombre: string;
}

interface Partido {
  partido: string;
  hora: string;
  canales: string[];
}

interface Liga {
  nombre: string;
  partidos: Partido[];
}

interface DiaPartidos {
  dia: string;
  ligas: Liga[];
}

export default function PartidosList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [partidos, setPartidos] = useState<DiaPartidos[]>([]);
  const [filteredPartidos, setFilteredPartidos] = useState<DiaPartidos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState(0);

  useEffect(() => {
    const fetchPartidos = async () => {
      try {
        const response = await fetch('/api/partidos');
        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }
        const data = await response.json();
        setPartidos(data);
        setFilteredPartidos(data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los partidos');
        setLoading(false);
      }
    };

    fetchPartidos();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredPartidos(partidos);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    
    const filtered = partidos.map(dia => ({
      ...dia,
      ligas: dia.ligas.map(liga => ({
        ...liga,
        partidos: liga.partidos.filter(partido =>
          partido.partido.toLowerCase().includes(searchTermLower)
        )
      })).filter(liga => liga.partidos.length > 0)
    })).filter(dia => dia.ligas.length > 0);

    setFilteredPartidos(filtered);
  }, [searchTerm, partidos]);

  const handleDay = (isPrev: boolean) => {
    if (isPrev && currentDay === 0) {
      return;
    }
    if (!isPrev && currentDay === partidos.length - 1) {
      return;
    }
    const newDay = currentDay + (isPrev ? -1 : 1);
    setCurrentDay(newDay);
  };

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
      <Input
        type="text"
        placeholder="Buscar partidos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-8 bg-[#1E1E1E]"
      />

      <div id="partidosContainer">
        {(() => {
          const dia = filteredPartidos[currentDay];
          if (!dia) return null;
          
          return (
            <div className="dia-container">
              <h2 className="text-2xl font-bold mb-6 flex items-center justify-between">
                  <button onClick={() => handleDay(true)} className="cursor-pointer hover:text-gray-400">←</button>
                  {dia.dia}
                  <button onClick={() => handleDay(false)} className="cursor-pointer hover:text-gray-400">→</button>
              </h2>
              {dia.ligas.map((liga, ligaIndex) => (
                <div key={ligaIndex} className="mb-12 liga-container">
                  <h3 className="text-2xl font-bold text-yellow-200 mb-2">{liga.nombre}</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {liga.partidos.map((partido, partidoIndex) => (
                      <Card key={partidoIndex}>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-semibold text-white">⚽ {partido.partido}</h2>
                            <span className="text-sm text-gray-400">🕐 {partido.hora}</span>
                          </div>

                          <div className="border-t border-gray-700 pt-3">
                            <ul className="space-y-1 text-sm text-gray-400">
                              {partido.canales.map((canal, canalIndex) => (
                                <li key={canalIndex}>📺 {canal}</li>
                              ))}
                            </ul>
                          </div>
                          </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {filteredPartidos.length === 0 && (
          <p className="text-center text-gray-500 mt-10">No hay partidos que coincidan con tu búsqueda.</p>
        )}
      </div>
    </>
  );
}