import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET() {
  try {
    const url = 'https://www.futbolenlatv.com/';
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const resultado = [];
    let diaActual = '';
    let ligaActual = '';

    $('table.tablaPrincipal tr').each((_, el) => {
      const fila = $(el);

      // Detectar día
      if (fila.hasClass('cabeceraTabla')) {
        const textoDia = fila.find('td').text().trim();
        diaActual = textoDia.replace('Partidos de hoy ', '').trim();

        // Asegurar estructura en resultado
        if (!resultado.find(d => d.dia === diaActual)) {
          resultado.push({ dia: diaActual, ligas: [] });
        }
        return;
      }

      // Detectar liga
      if (fila.hasClass('cabeceraCompericion')) {
        // Intentar obtener el nombre de la liga del internalLink
        ligaActual = fila.find('.internalLink').text().trim();
        
        // Si no hay internalLink, buscar en el td con colspan
        if (!ligaActual) {
          const tdLiga = fila.find('td[colspan="5"]');
          if (tdLiga.length) {
            // Obtener el texto eliminando espacios extra
            ligaActual = tdLiga.text().trim().replace(/\s+/g, ' ');
          }
        }

        const diaObj = resultado.find(d => d.dia === diaActual);
        if (diaObj && !diaObj.ligas.find(l => l.nombre === ligaActual)) {
          diaObj.ligas.push({ nombre: ligaActual, partidos: [] });
        }
        return;
      }

      // Detectar partido
      const hora = fila.find('td.hora').text().trim();
      if (!hora) return;

      const local = fila.find('td.local span').attr('title')?.trim() || '';
      const visitante = fila.find('td.visitante span').attr('title')?.trim() || '';

      const canales = [];
      fila.find('ul.listaCanales li').each((_, li) => {
        const canal = $(li).text().trim();
        if (canal) canales.push(canal);
      });

      const partido = {
        hora,
        partido: `${local} vs ${visitante}`,
        canales
      };

      const diaObj = resultado.find(d => d.dia === diaActual);
      const ligaObj = diaObj?.ligas.find(l => l.nombre === ligaActual);
      ligaObj?.partidos.push(partido);
    });

    return new Response(JSON.stringify(resultado), {
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al obtener los partidos' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}


