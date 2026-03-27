import urllib.request
import os

os.makedirs('textures', exist_ok=True)

urls = {
    'mercury.jpg': 'https://www.solarsystemscope.com/textures/download/2k_mercury.jpg',
    'venus.jpg': 'https://www.solarsystemscope.com/textures/download/2k_venus_surface.jpg',
    'jupiter.jpg': 'https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg',
    'saturn.jpg': 'https://www.solarsystemscope.com/textures/download/2k_saturn.jpg',
    'neptune.jpg': 'https://www.solarsystemscope.com/textures/download/2k_neptune.jpg',
    'saturn_ring.png': 'https://www.solarsystemscope.com/textures/download/2k_saturn_ring_alpha.png'
}

for filename, url in urls.items():
    filepath = os.path.join('textures', filename)
    if not os.path.exists(filepath):
        print(f"Downloading {filename}...")
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response, open(filepath, 'wb') as out_file:
                out_file.write(response.read())
            print(f"Saved {filename}")
        except Exception as e:
            print(f"Failed to download {filename}: {e}")
