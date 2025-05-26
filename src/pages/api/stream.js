export async function GET({ request }) {
  const url = new URL(request.url);
  const canal = decodeURIComponent(url.searchParams.get("url")); 

  try {
    const response = await fetch(canal);
    const text = await response.text();
    const cleanedText = text.replace(/(?<="name":\s*")(.*?)(\r?\n)(.*?)(?=")/g, (_, p1, _nl, p2) => `${p1} ${p2}`);
    return new Response(cleanedText, {
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
