#!/usr/bin/env python3
"""
Extractor de progresiones/propósitos/contenidos de los programas oficiales DGB.

Lee scripts/manifiesto_dgb.json, descarga cada PDF (una sola vez, reanudable),
extrae SOLO lo que alimenta a EduPlan MX:
  - propósito formativo
  - progresiones de aprendizaje (numeradas)
  - metas de aprendizaje
  - contenidos formativos / temáticas

Salidas:
  data/pdfs_dgb/<slug>.pdf          (crudos, ignorados por git)
  data/extraccion/json/<slug>.json  (estructurado, para integrar al catálogo)
  data/extraccion/md/<slug>.md      (legible, para revisión humana)
  data/extraccion/_reporte.md       (tabla de calidad de toda la corrida)

Uso:
  python3 scripts/extraer_progresiones.py                # todo el manifiesto
  python3 scripts/extraer_progresiones.py --filtro "Cultura Digital"
  python3 scripts/extraer_progresiones.py --limite 5
  python3 scripts/extraer_progresiones.py --solo-parsear # no descarga, re-parsea PDFs locales

100% local y gratuito: PyPDF2 + regex, sin APIs de pago.
"""

import argparse
import json
import re
import ssl
import sys
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

import certifi
from PyPDF2 import PdfReader

CTX_SSL = ssl.create_default_context(cafile=certifi.where())

RAIZ = Path(__file__).resolve().parent.parent
MANIFIESTO = RAIZ / "scripts" / "manifiesto_dgb.json"
DIR_PDFS = RAIZ / "data" / "pdfs_dgb"
DIR_JSON = RAIZ / "data" / "extraccion" / "json"
DIR_MD = RAIZ / "data" / "extraccion" / "md"

UA = {"User-Agent": "Mozilla/5.0 (EduPlanMX; extractor educativo; contacto: docente BGO Puebla)"}

# Encabezados que delimitan el FIN de una sección de interés.
# SENSIBLE a mayúsculas: los encabezados de la DGB van en ALTAS; en minúsculas
# estas mismas palabras aparecen en el cuerpo del texto y truncarían de más.
FIN_SECCION = re.compile(
    r"(ORIENTACIONES|EVALUACI[ÓO]N|BIBLIOGRAF[ÍI]A|REFERENCIAS|TRANSVERSALIDAD|"
    r"RECURSOS SOCIOEMOCIONALES|CR[ÉE]DITOS|DIRECTORIO|ANEXOS|GLOSARIO|"
    r"METAS DE APRENDIZAJE|CONTENIDOS FORMATIVOS|PROGRESIONES DE|PROP[ÓO]SITO FORMATIVO|"
    r"\n\s*[IVX]{1,4}\.\s+[A-ZÁÉÍÓÚ])"
)


def slugify(nombre: str) -> str:
    s = unicodedata.normalize("NFD", nombre)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s[:80]


def codificar_url(url: str) -> str:
    """Los PDFs de la DGB traen acentos SIN codificar en la ruta; urllib los rechaza."""
    partes = urllib.parse.urlsplit(url)
    # safe incluye % para NO recodificar los %20 que ya vienen codificados
    ruta = urllib.parse.quote(partes.path, safe="/%")
    return urllib.parse.urlunsplit((partes.scheme, partes.netloc, ruta, partes.query, partes.fragment))


def descargar(url: str, destino: Path) -> str:
    if destino.exists() and destino.stat().st_size > 10_000:
        return "ya_descargado"
    try:
        req = urllib.request.Request(codificar_url(url), headers=UA)
        with urllib.request.urlopen(req, timeout=60, context=CTX_SSL) as r:
            datos = r.read()
        if len(datos) < 10_000 or not datos[:5].startswith(b"%PDF"):
            return f"ERROR: respuesta no es PDF ({len(datos)} bytes)"
        destino.write_bytes(datos)
        return f"descargado ({len(datos)//1024} KB)"
    except Exception as e:
        return f"ERROR: {e}"


def extraer_texto(pdf: Path) -> str:
    try:
        reader = PdfReader(str(pdf))
        paginas = []
        for p in reader.pages:
            t = p.extract_text() or ""
            paginas.append(t)
        return "\n".join(paginas)
    except Exception as e:
        return f"__ERROR_LECTURA__ {e}"


def limpiar(t: str) -> str:
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()


def cortar_en_fin_de_seccion(texto: str, max_chars: int) -> str:
    """Recorta el fragmento donde empiece el siguiente encabezado de sección."""
    m = FIN_SECCION.search(texto, 40)  # ignora las primeras posiciones (es el propio título)
    if m:
        texto = texto[: m.start()]
    return limpiar(texto)[:max_chars]


def buscar_seccion(texto: str, patrones: list[str], max_chars: int = 4000) -> str:
    for pat in patrones:
        m = re.search(pat, texto, re.IGNORECASE)
        if m:
            return cortar_en_fin_de_seccion(texto[m.end(): m.end() + max_chars + 500], max_chars)
    return ""


def extraer_numerados(fragmento: str, minimo_chars: int = 25) -> list[dict]:
    """Divide un fragmento en items numerados: '1. ...' o '1) ...'"""
    items = []
    # posiciones de cada arranque numerado al inicio de línea (o tras punto)
    arranques = [(m.start(), int(m.group(1))) for m in re.finditer(r"(?:^|\n)\s*(\d{1,2})[\.\)]\s+", fragmento)]
    for i, (pos, num) in enumerate(arranques):
        fin = arranques[i + 1][0] if i + 1 < len(arranques) else len(fragmento)
        cuerpo = limpiar(re.sub(r"^\s*\d{1,2}[\.\)]\s+", "", fragmento[pos:fin]))
        if len(cuerpo) >= minimo_chars:
            items.append({"id": num, "descripcion": cuerpo[:1200]})
    # descartar numeraciones incoherentes (ej. capturó números de página)
    if items and sum(1 for k, it in enumerate(items[:5]) if it["id"] == k + 1) < 2:
        return []
    return items


def extraer_formato_tabla_metas(frag: str) -> tuple[list[dict], list[str]]:
    """
    Formato de los programas fundamentales 2023-2026:
    cada progresión es un PÁRRAFO (sin número) seguido de una tabla
    'METAS  CATEGORÍA  SUBCATEGORÍA' con items M1..Mn / C1 / S1..Sn.
    """
    # Dos variantes de tabla: "METAS CATEGORÍA(S)" (mayoría) y
    # "METAS CONCEPTOS TRANSVERSALES" (UACs de CNEyT)
    headers = [m.start() for m in re.finditer(r"METAS\s+(?:CATEGOR[ÍI]A|CONCEPTOS)", frag)]
    if len(headers) < 2:
        return [], []

    progresiones = []
    for idx, h in enumerate(headers):
        antes = frag[:h]
        # El párrafo de la progresión es lo que hay DESPUÉS del final de la
        # tabla anterior (última fila S# o número de página suelto).
        cortes = [m.end() for m in re.finditer(r"(?:\bS\d{1,2}\s[^\n]{0,60}\n)|(?:\n\s*\d{1,3}\s*\n)", antes)]
        inicio = cortes[-1] if cortes else max(0, h - 1500)
        parrafo = limpiar(antes[inicio:].replace("\n", " "))
        # limpiar restos de encabezado de sección y la línea "CONCEPTO CENTRAL: ..." (formato CNEyT)
        parrafo = re.sub(r"^.*PROGRESIONES DE APRENDIZAJE\s*", "", parrafo, flags=re.IGNORECASE)
        parrafo = re.sub(r"CONCEPTO CENTRAL\s*:?.*$", "", parrafo).strip()
        # descartar residuos de tablas (filas CT/M/S/C sueltas)
        parrafo = re.sub(r"^(?:C[TC]?\d{1,2}\.?\s+[^.]{0,80}\.\s*)+", "", parrafo).strip()
        if len(parrafo) >= 60:
            progresiones.append({"id": idx + 1, "descripcion": parrafo[:1200]})

    # Metas de la primera tabla (se repiten en todas): M1..Mn
    metas = []
    primera_tabla = frag[headers[0]: headers[0] + 2500]
    for m in re.finditer(r"M(\d{1,2})\s+(.{20,300}?)(?=M\d{1,2}\s|C\d{1,2}\s|$)", primera_tabla.replace("\n", " ")):
        metas.append(limpiar(m.group(2))[:350])

    return progresiones, metas


def extraer_formato_tema_metas(texto: str) -> tuple[list[dict], list[str]]:
    """
    Formato de las UAC de Humanidades (2023-2026):
    párrafo de la progresión → línea 'Tema: X/Y' → 'METAS' →
    tabla CATEGORÍA / SUBCATEGORÍAS / DIMENSIONES.
    """
    headers = [m.start() for m in re.finditer(r"Tema:\s*[^\n]+\n\s*METAS", texto)]
    if len(headers) < 3:
        return [], []

    progresiones = []
    limites = [0] + headers
    for idx, h in enumerate(headers):
        chunk = texto[limites[idx]:h]
        # El párrafo de la progresión es el último bloque de texto "corrido"
        # (separado por líneas en blanco) antes de la línea "Tema:"
        piezas = [p for p in re.split(r"\n\s*\n", chunk)]
        parrafo = ""
        for pieza in reversed(piezas):
            plano = limpiar(pieza.replace("\n", " "))
            # descartar residuos de tabla (dimensiones numeradas, encabezados)
            if len(plano) >= 80 and "SUBCATEGOR" not in plano and "DIMENSION" not in plano \
                    and not re.match(r"^\d\.\s", plano):
                parrafo = plano
                break
        if parrafo:
            progresiones.append({"id": idx + 1, "descripcion": parrafo[:1200]})

    # Metas del primer bloque (texto entre METAS y CATEGORÍA)
    metas = []
    m = re.search(r"METAS\s*\n(.{50,1500}?)CATEGOR", texto[headers[0]:headers[0] + 2500], re.DOTALL)
    if m:
        for linea in re.split(r"\n\s*\n", m.group(1)):
            plano = limpiar(linea.replace("\n", " "))
            if len(plano) >= 40:
                metas.append(plano[:350])

    return progresiones, metas


def parsear(texto: str) -> dict:
    texto = texto.replace("\r", "\n")

    proposito = buscar_seccion(texto, [
        r"PROP[ÓO]SITO\s+FORMATIVO(?:\s+DE\s+LA\s+UAC)?",
        r"PROP[ÓO]SITO\s+DE\s+LA\s+UAC",
        r"PROP[ÓO]SITO\s+GENERAL",
        r"\bPROP[ÓO]SITO\b",
    ], max_chars=1200)

    frag_prog = buscar_seccion(texto, [
        r"PROGRESIONES\s+DE(?:L)?\s+APRENDIZAJE",
        r"PROGRESIONES\s+Y\s+METAS",
        r"\bPROGRESIONES\b",
    ], max_chars=60000)
    progresiones = extraer_numerados(frag_prog)
    metas_tabla: list[str] = []

    # Estrategia 2: formato "párrafo + tabla METAS/CATEGORÍA/SUBCATEGORÍA"
    if len(progresiones) < 3 and frag_prog:
        prog_tabla, metas_tabla = extraer_formato_tabla_metas(frag_prog)
        if len(prog_tabla) > len(progresiones):
            progresiones = prog_tabla

    # Estrategia 2b: mismas tablas pero buscadas en TODO el documento
    # (varios programas no tienen el encabezado "PROGRESIONES DE APRENDIZAJE")
    if len(progresiones) < 3:
        prog_tabla, metas2 = extraer_formato_tabla_metas(texto)
        if len(prog_tabla) > len(progresiones):
            progresiones = prog_tabla
            if metas2 and not metas_tabla:
                metas_tabla = metas2

    # Estrategia 2c: formato Humanidades (párrafo → "Tema:" → METAS)
    if len(progresiones) < 3:
        prog_tema, metas3 = extraer_formato_tema_metas(texto)
        if len(prog_tema) > len(progresiones):
            progresiones = prog_tema
            if metas3 and not metas_tabla:
                metas_tabla = metas3

    # Fallback: patrón "Progresión 1." repartido por el documento
    if not progresiones:
        sueltas = re.split(r"Progresi[óo]n\s+(\d{1,2})[\.:]?\s*", texto)
        if len(sueltas) > 2:
            progresiones = []
            for j in range(1, len(sueltas) - 1, 2):
                num = int(sueltas[j])
                cuerpo = cortar_en_fin_de_seccion(sueltas[j + 1], 1200)
                if len(cuerpo) >= 25:
                    progresiones.append({"id": num, "descripcion": cuerpo})

    frag_metas = buscar_seccion(texto, [r"METAS\s+DE\s+APRENDIZAJE"], max_chars=6000)
    metas = [it["descripcion"][:400] for it in extraer_numerados(frag_metas)] if frag_metas else []
    if not metas and metas_tabla:
        metas = metas_tabla

    frag_cont = buscar_seccion(texto, [
        r"CONTENIDOS\s+FORMATIVOS",
        r"CONTENIDOS\s+CENTRALES",
        r"\bCONTENIDOS\b",
        r"TEM[ÁA]TICAS",
    ], max_chars=8000)
    contenidos_items = extraer_numerados(frag_cont, minimo_chars=10)
    contenidos = [it["descripcion"][:300] for it in contenidos_items]
    if not contenidos and frag_cont:
        # sin numeración: guardar el bloque como un solo texto
        contenidos = [frag_cont[:1500]]

    return {
        "proposito": proposito,
        "progresiones": progresiones,
        "metas_aprendizaje": metas,
        "contenidos": contenidos,
        "chars_texto_total": len(texto),
    }


def calidad(r: dict) -> str:
    n = len(r["progresiones"])
    if r["chars_texto_total"] < 1000:
        return "SIN_TEXTO(escaneado?)"
    if n >= 5 and r["proposito"]:
        return "BUENA"
    if n >= 3 or (n >= 1 and r["proposito"]):
        return "MEDIA"
    if r["proposito"] or r["contenidos"]:
        return "PARCIAL"
    return "FALLIDA"


def a_markdown(prog: dict, r: dict) -> str:
    md = [f"# {prog['nombre']}", "",
          f"- **Generación:** {prog['generacion']}  |  **Componente:** {prog['componente']}",
          f"- **Fuente:** {prog['url']}", ""]
    if r["proposito"]:
        md += ["## Propósito formativo", "", r["proposito"], ""]
    if r["progresiones"]:
        md += [f"## Progresiones de aprendizaje ({len(r['progresiones'])})", ""]
        for p in r["progresiones"]:
            md += [f"**{p['id']}.** {p['descripcion']}", ""]
    if r["metas_aprendizaje"]:
        md += ["## Metas de aprendizaje", ""]
        md += [f"- {m}" for m in r["metas_aprendizaje"]] + [""]
    if r["contenidos"]:
        md += ["## Contenidos / temáticas", ""]
        md += [f"- {c}" for c in r["contenidos"]] + [""]
    return "\n".join(md)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--filtro", default="", help="Procesar solo programas cuyo nombre contenga este texto")
    ap.add_argument("--limite", type=int, default=0, help="Procesar máximo N programas")
    ap.add_argument("--solo-parsear", action="store_true", help="No descargar; re-parsear PDFs ya locales")
    args = ap.parse_args()

    for d in (DIR_PDFS, DIR_JSON, DIR_MD):
        d.mkdir(parents=True, exist_ok=True)

    programas = json.loads(MANIFIESTO.read_text())["programas"]
    if args.filtro:
        programas = [p for p in programas if args.filtro.lower() in p["nombre"].lower()]
    if args.limite:
        programas = programas[: args.limite]

    reporte = []
    for i, prog in enumerate(programas, 1):
        slug = f"{slugify(prog['nombre'])}--{prog['generacion']}"
        pdf = DIR_PDFS / f"{slug}.pdf"

        estado_dl = "local" if args.solo_parsear else descargar(prog["url"], pdf)
        if not pdf.exists():
            reporte.append({"nombre": prog["nombre"], "gen": prog["generacion"], "calidad": "SIN_PDF", "detalle": estado_dl, "n_prog": 0})
            print(f"[{i}/{len(programas)}] ✗ {prog['nombre']} → {estado_dl}", flush=True)
            continue

        texto = extraer_texto(pdf)
        r = parsear(texto)
        q = calidad(r)

        salida = {**prog, "slug": slug, **{k: r[k] for k in ("proposito", "progresiones", "metas_aprendizaje", "contenidos")},
                  "calidad_extraccion": q, "extraido_con": "extraer_progresiones.py v1"}
        (DIR_JSON / f"{slug}.json").write_text(json.dumps(salida, ensure_ascii=False, indent=1))
        (DIR_MD / f"{slug}.md").write_text(a_markdown(prog, r))

        reporte.append({"nombre": prog["nombre"], "gen": prog["generacion"], "calidad": q,
                        "detalle": estado_dl, "n_prog": len(r["progresiones"])})
        print(f"[{i}/{len(programas)}] {'✓' if q in ('BUENA','MEDIA') else '△'} {prog['nombre']} → {q} ({len(r['progresiones'])} progresiones)", flush=True)

    # Reporte global
    lineas = ["# Reporte de extracción DGB", "", "| Programa | Gen | Calidad | Progresiones |", "|---|---|---|---|"]
    for r in sorted(reporte, key=lambda x: (x["calidad"], x["nombre"])):
        lineas.append(f"| {r['nombre']} | {r['gen']} | {r['calidad']} | {r['n_prog']} |")
    resumen = {}
    for r in reporte:
        resumen[r["calidad"]] = resumen.get(r["calidad"], 0) + 1
    lineas += ["", "## Resumen", ""] + [f"- **{k}**: {v}" for k, v in sorted(resumen.items())]
    (RAIZ / "data" / "extraccion" / "_reporte.md").write_text("\n".join(lineas))

    print("\n" + "=" * 50)
    for k, v in sorted(resumen.items()):
        print(f"  {k}: {v}")
    print(f"Reporte completo: data/extraccion/_reporte.md")


if __name__ == "__main__":
    main()
