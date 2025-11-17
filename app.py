# app.py
from flask import Flask, render_template, request
from models.mock_model import analyze_deception
import tempfile, os

app = Flask(__name__, template_folder='templates', static_folder='static')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    text = (request.form.get('text') or '').strip()
    audio = request.files.get('audio')
    video = request.files.get('video')

    temp_audio = None
    temp_video = None

    # Save uploaded audio if present
    if audio and audio.filename != '':
        temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio.filename)[1])
        audio.save(temp_audio.name)

    # Save uploaded video if present
    if video and video.filename != '':
        temp_video = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(video.filename)[1])
        video.save(temp_video.name)

    result = analyze_deception(
        text=text if text else None,
        audio_file=temp_audio.name if temp_audio else None,
        video_file=temp_video.name if temp_video else None
    )

    # clean up temp files
    try:
        if temp_audio:
            os.unlink(temp_audio.name)
    except Exception:
        pass
    try:
        if temp_video:
            os.unlink(temp_video.name)
    except Exception:
        pass

    return render_template('result.html', result=result, text=text)

if __name__ == '__main__':
    app.run(debug=True)
