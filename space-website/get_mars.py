import urllib.request
import os

os.makedirs('textures', exist_ok=True)

mars_url = 'https://www.solarsystemscope.com/textures/download/2k_mars.jpg'
mars_path = os.path.join('textures', 'mars.jpg')

if not os.path.exists(mars_path):
    print("Downloading mars.jpg...")
    req = urllib.request.Request(mars_url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response, open(mars_path, 'wb') as out_file:
            out_file.write(response.read())
        print("Saved mars.jpg")
    except Exception as e:
        print("Failed to download mars.jpg:", e)
