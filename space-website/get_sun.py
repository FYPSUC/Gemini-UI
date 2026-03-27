import urllib.request
import os

os.makedirs('textures', exist_ok=True)

sun_url = 'https://www.solarsystemscope.com/textures/download/2k_sun.jpg'
sun_path = os.path.join('textures', 'sun.jpg')

if not os.path.exists(sun_path):
    print("Downloading sun.jpg...")
    req = urllib.request.Request(sun_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response, open(sun_path, 'wb') as out_file:
        out_file.write(response.read())
    print("Saved sun.jpg")
