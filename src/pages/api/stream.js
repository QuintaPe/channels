export async function GET() {
  const url = "https://af1cionados.vercel.app/AcEStREAM%20iDs.w3u";

  try {
    const response = await fetch(url);
    const text = await response.text();

    return new Response(text, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=0, must-revalidate"
      },
    });
  } catch (error) {
    return new Response("Error al obtener el archivo", { status: 500 });
  }
}
