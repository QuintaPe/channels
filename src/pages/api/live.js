export async function GET() {
  try {
    const response = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
      headers: {
        "X-RapidAPI-Key": import.meta.env.RAPID_API_KEY,
        "X-RapidAPI-Host": "v3.football.api-sports.io"
      }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({
        error: 'Error en la respuesta del servidor'
      }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Error al cargar los partidos'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
