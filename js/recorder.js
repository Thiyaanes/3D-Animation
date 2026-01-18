/**
 * Recorder - Video recording using MediaRecorder API
 */

export class Recorder {
    constructor(canvas) {
        this.canvas = canvas;
        this.mediaRecorder = null;
        this.chunks = [];
        this.isRecording = false;
        this.duration = 5;
        this.startTime = 0;
        this.timerInterval = null;

        // Callbacks
        this.onStart = null;
        this.onStop = null;
        this.onProgress = null;
    }

    setDuration(seconds) {
        this.duration = seconds;
    }

    canRecord() {
        return typeof MediaRecorder !== 'undefined' &&
            this.canvas.captureStream !== undefined;
    }

    start() {
        if (this.isRecording || !this.canRecord()) return false;

        try {
            // Get canvas stream
            const stream = this.canvas.captureStream(30); // 30 FPS

            // Determine supported mime type
            const mimeTypes = [
                'video/webm;codecs=vp9',
                'video/webm;codecs=vp8',
                'video/webm',
                'video/mp4'
            ];

            let selectedMimeType = '';
            for (const mimeType of mimeTypes) {
                if (MediaRecorder.isTypeSupported(mimeType)) {
                    selectedMimeType = mimeType;
                    break;
                }
            }

            if (!selectedMimeType) {
                console.error('No supported video format found');
                return false;
            }

            // Create recorder
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: selectedMimeType,
                videoBitsPerSecond: 5000000 // 5 Mbps
            });

            this.chunks = [];

            // Handle data available
            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.chunks.push(e.data);
                }
            };

            // Handle stop
            this.mediaRecorder.onstop = () => {
                this.isRecording = false;
                clearInterval(this.timerInterval);

                // Create blob and download
                const blob = new Blob(this.chunks, { type: selectedMimeType });
                this.downloadBlob(blob);

                if (this.onStop) this.onStop();
            };

            // Start recording
            this.mediaRecorder.start(100);
            this.isRecording = true;
            this.startTime = Date.now();

            // Start timer
            this.startTimer();

            // Auto-stop after duration
            setTimeout(() => {
                this.stop();
            }, this.duration * 1000);

            if (this.onStart) this.onStart();

            return true;
        } catch (error) {
            console.error('Failed to start recording:', error);
            return false;
        }
    }

    stop() {
        if (!this.isRecording || !this.mediaRecorder) return;

        this.mediaRecorder.stop();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = (Date.now() - this.startTime) / 1000;
            if (this.onProgress) {
                this.onProgress(elapsed, this.duration);
            }
        }, 100);
    }

    downloadBlob(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `3d-animation-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}
