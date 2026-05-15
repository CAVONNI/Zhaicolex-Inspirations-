import urllib.request
import os

# =============================================
#   ZHAICOLEX INSPIRATIONS
#   Script para descargar imágenes del catálogo
# =============================================

# Carpeta donde se guardarán las imágenes
CARPETA = "imagenes"

# Lista de imágenes: (nombre_archivo, url)
imagenes = [
    ("1_million.jpg",         "https://lorens.com.co/wp-content/uploads/1-Million-de-Paco-Rabanne-para-hombre-200ml.jpg"),
    ("1_million_elixir.jpg",  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqATF09pnX-TkSvazo9wCzR69o1wdPHk8g0A&s"),
    ("1_million_intense.jpg", "https://www.perfumerialasvillas.net/wp-content/uploads/2023/10/v01-63e4d37210a03-_nestor_parfum-amcc8aoexgd-oo6c8ph2h99.jpg"),
    ("1_million_lucky.jpg",   "https://www.alcarrito.com/media/catalog/product/o/i/oip_88_.jpg?width=400&height=400&canvas=400,400&optimize=medium&bg-color=255,255,255&fit=bounds"),
    ("1_million_prive.webp",  "https://http2.mlstatic.com/D_NQ_NP_610698-MCO90079471847_082025-O.webp"),
    ("1_million_royal.jpg",   "https://disfragancias.com/cdn/shop/products/One-million-royal.jpg?v=1699808190"),
    ("coconut_passion.jpg",   "https://fimgs.net/mdimg/perfume/o.7993.jpg"),
    ("coco_mademoiselle.jpg", "https://media.falabella.com/falabellaCO/3443687_1/w=1500,h=1500,fit=cover"),
]

# =============================================
#   CREAR CARPETA SI NO EXISTE
# =============================================
if not os.path.exists(CARPETA):
    os.makedirs(CARPETA)
    print(f'✅ Carpeta "{CARPETA}/" creada.\n')
else:
    print(f'📁 Carpeta "{CARPETA}/" ya existe.\n')

# =============================================
#   DESCARGAR CADA IMAGEN
# =============================================
exitosas = []
fallidas = []

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

for nombre, url in imagenes:
    ruta = os.path.join(CARPETA, nombre)
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as response:
            with open(ruta, "wb") as f:
                f.write(response.read())
        print(f"  ✅ {nombre}")
        exitosas.append(nombre)
    except Exception as e:
        print(f"  ❌ {nombre}  →  Error: {e}")
        fallidas.append(nombre)

# =============================================
#   RESUMEN FINAL
# =============================================
print("\n" + "="*45)
print(f"  Descargadas: {len(exitosas)}/{len(imagenes)}")
if fallidas:
    print(f"  Fallidas:    {len(fallidas)}")
    for f in fallidas:
        print(f"    - {f}")
print("="*45)
print("\n✅ ¡Listo! Revisa la carpeta 'imagenes/'")
print("   Ahora puedes reemplazar los src en tu HTML así:")
print('   <img src="imagenes/1_million.jpg" />')
