"""
3D Animation Agent - Backend Server
FastAPI backend for handling 3D model uploads and processing
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
import os
import shutil
import uuid
from datetime import datetime
from pathlib import Path
import json

app = FastAPI(
    title="3D Animation Agent API",
    description="Backend for 3D model upload and animation processing",
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Supported file formats
SUPPORTED_FORMATS = {".glb", ".gltf", ".obj", ".fbx"}

# Store model metadata
models_db = {}


@app.get("/")
async def root():
    """Root endpoint - serves the frontend"""
    return FileResponse("index.html")


@app.get("/api")
async def api_info():
    """API info endpoint"""
    return {
        "message": "3D Animation Agent API",
        "version": "1.0.0",
        "endpoints": {
            "upload": "/api/upload",
            "models": "/api/models",
            "model": "/api/models/{model_id}",
            "animate": "/api/animate",
            "health": "/api/health"
        }
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/api/upload")
async def upload_model(file: UploadFile = File(...)):
    """
    Upload a 3D model file
    Returns model info including ID, filename, and available animations
    """
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in SUPPORTED_FORMATS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Supported: {', '.join(SUPPORTED_FORMATS)}"
        )
    
    # Generate unique ID
    model_id = str(uuid.uuid4())[:8]
    
    # Save file
    file_path = UPLOAD_DIR / f"{model_id}{file_ext}"
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Get file size
    file_size = os.path.getsize(file_path)
    
    # Create model metadata
    model_info = {
        "id": model_id,
        "filename": file.filename,
        "format": file_ext[1:].upper(),
        "size": file_size,
        "size_formatted": format_file_size(file_size),
        "uploaded_at": datetime.now().isoformat(),
        "file_path": str(file_path),
        "available_animations": [
            "rotate", "spin", "bounce", "float", "pulse", 
            "wave", "shake", "swing", "jump", "dance",
            "wobble", "roll", "flip", "breathe", "walk"
        ],
        "status": "ready"
    }
    
    # Store in memory database
    models_db[model_id] = model_info
    
    return JSONResponse(content={
        "success": True,
        "message": "Model uploaded successfully",
        "model": model_info
    })


@app.get("/api/models")
async def list_models():
    """List all uploaded models"""
    return {
        "count": len(models_db),
        "models": list(models_db.values())
    }


@app.get("/api/models/{model_id}")
async def get_model(model_id: str):
    """Get a specific model by ID"""
    if model_id not in models_db:
        raise HTTPException(status_code=404, detail="Model not found")
    return models_db[model_id]


@app.get("/api/models/{model_id}/download")
async def download_model(model_id: str):
    """Download a model file"""
    if model_id not in models_db:
        raise HTTPException(status_code=404, detail="Model not found")
    
    model = models_db[model_id]
    file_path = Path(model["file_path"])
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    return FileResponse(
        path=file_path,
        filename=model["filename"],
        media_type="application/octet-stream"
    )


@app.delete("/api/models/{model_id}")
async def delete_model(model_id: str):
    """Delete a model"""
    if model_id not in models_db:
        raise HTTPException(status_code=404, detail="Model not found")
    
    model = models_db[model_id]
    file_path = Path(model["file_path"])
    
    # Delete file
    if file_path.exists():
        os.remove(file_path)
    
    # Remove from database
    del models_db[model_id]
    
    return {"success": True, "message": "Model deleted successfully"}


@app.post("/api/animate")
async def animate_model(request: dict):
    """
    Process animation request for a model
    Returns animation parameters and settings
    """
    model_id = request.get("model_id")
    animation_type = request.get("animation", "rotate")
    speed = request.get("speed", 1.0)
    duration = request.get("duration", 5)
    
    # Animation presets with parameters
    animation_presets = {
        "rotate": {"axis": "y", "speed": 1.0, "description": "Smooth Y-axis rotation"},
        "spin": {"axis": "y", "speed": 3.0, "description": "Fast 360° spinning"},
        "bounce": {"height": 0.5, "frequency": 3, "description": "Vertical bouncing"},
        "float": {"height": 0.2, "frequency": 1.5, "description": "Gentle hovering"},
        "pulse": {"scale": 0.1, "frequency": 3, "description": "Breathing scale effect"},
        "wave": {"amplitude": 0.3, "frequency": 2, "description": "Oscillating motion"},
        "shake": {"amplitude": 0.05, "frequency": 20, "description": "Quick vibration"},
        "swing": {"angle": 0.5, "frequency": 2, "description": "Pendulum motion"},
        "jump": {"height": 0.8, "squash": 0.1, "description": "Jump with squash/stretch"},
        "dance": {"complexity": "high", "description": "Fun dance moves"},
        "wobble": {"x_angle": 0.2, "z_angle": 0.2, "description": "Unstable wobbling"},
        "roll": {"axis": "x", "speed": 2, "description": "X-axis rotation"},
        "flip": {"axis": "x", "bounce": True, "description": "Flip with bounce"},
        "breathe": {"scale": 0.05, "frequency": 1.5, "description": "Subtle breathing"},
        "walk": {"step_height": 0.1, "sway": 0.1, "description": "Walking motion"}
    }
    
    if animation_type not in animation_presets:
        available = list(animation_presets.keys())
        raise HTTPException(
            status_code=400,
            detail=f"Unknown animation '{animation_type}'. Available: {', '.join(available)}"
        )
    
    preset = animation_presets[animation_type]
    
    return {
        "success": True,
        "animation": {
            "type": animation_type,
            "parameters": preset,
            "speed": speed,
            "duration": duration,
            "model_id": model_id
        },
        "message": f"Animation '{animation_type}' applied: {preset['description']}"
    }


@app.get("/api/animations")
async def list_animations():
    """List all available animations with descriptions"""
    animations = {
        "motion": [
            {"name": "rotate", "icon": "sync-alt", "description": "Smooth rotation"},
            {"name": "spin", "icon": "redo", "description": "Fast spinning"},
            {"name": "bounce", "icon": "arrow-up", "description": "Bouncing"},
            {"name": "float", "icon": "feather", "description": "Hovering"},
            {"name": "jump", "icon": "arrow-up", "description": "Jumping"},
            {"name": "walk", "icon": "walking", "description": "Walking"}
        ],
        "effects": [
            {"name": "pulse", "icon": "heartbeat", "description": "Pulsing"},
            {"name": "wave", "icon": "water", "description": "Waving"},
            {"name": "shake", "icon": "hand-paper", "description": "Shaking"},
            {"name": "swing", "icon": "bezier-curve", "description": "Swinging"},
            {"name": "wobble", "icon": "random", "description": "Wobbling"},
            {"name": "breathe", "icon": "lungs", "description": "Breathing"}
        ],
        "special": [
            {"name": "dance", "icon": "music", "description": "Dancing"},
            {"name": "roll", "icon": "sync", "description": "Rolling"},
            {"name": "flip", "icon": "retweet", "description": "Flipping"}
        ]
    }
    return animations


def format_file_size(size_bytes: int) -> str:
    """Format file size in human readable format"""
    for unit in ["B", "KB", "MB", "GB"]:
        if size_bytes < 1024:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.1f} TB"


# Serve static files (frontend)
app.mount("/", StaticFiles(directory=".", html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    print("Starting 3D Animation Agent Backend...")
    print("API docs available at: http://localhost:8000/docs")
    print("Frontend available at: http://localhost:8000")
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=False)
