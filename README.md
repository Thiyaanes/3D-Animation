#  3D Animation Agent

Upload 3D models and animate them with text prompts!!

##  Quick Start

for using it in your own ide

1. Start the server:
```bash
npx serve . -p 3000
```

2. Open: **http://localhost:3000**

##  Features

- **Upload Models** - GLB, GLTF, OBJ, FBX (drag & drop or click)
- **15+ Animations** - rotate, bounce, spin, float, pulse, wave, shake, jump, dance, wobble, walk...
- **Video Export** - Record as WebM and download
- **Modern Dark UI** - Smooth animations, glassmorphism design

##  Usage

1. **Load a Model** - Drag a file or click sample buttons (Cube/Sphere/Torus)
2. **Animate** - Click preset buttons or type commands like "dance"
3. **Record** - Set duration and click Record Video
4. **Camera** - Drag to orbit, scroll to zoom

##  Files

finaldesnek/

├── README.md
├── index.html
├── requirements.txt
├── server.py
├── css/
│   ├── style.css
│   └── fix.css
└── js/
    ├── animator.js
    ├── app.js
    ├── recorder.js
    └── scene.js

##  Tech

- Three.js for 3D rendering
- MediaRecorder API for video
- Pure HTML/CSS/JS 

---

link for web : https://threed-animation-erym.onrender.com

it takes some time to load probably 20 sec to start on render
