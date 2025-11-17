# models/mock_model.py
import random

def analyze_deception(text="", audio_file=None, video_file=None):
    """
    Returns a dict:
      {
        "label": "Truth"|"Deceptive",
        "score": int 0..100,
        "text_score": int|None,
        "audio_score": int|None,
        "video_score": int|None
      }
    """

    deceptive_keywords = [
        "i swear", "i promise", "honestly", "trust me",
        "believe me", "i didn't", "i didn't do it", "i wasn't there",
        "it's not what it looks like", "i would never"
    ]

    # TEXT logic (strong signal)
    if text and text.strip():
        txt = text.lower()
        if any(k in txt for k in deceptive_keywords):
            t = random.randint(70, 95)
            return {
                "label": "Deceptive",
                "score": t,
                "text_score": t,
                "audio_score": None,
                "video_score": None
            }
        # small chance of deceptive if contains suspicious short denials
        if len(txt.split()) < 6 and any(word in txt for word in ["no", "didn't", "never", "not"]):
            t = random.randint(50, 75)
            label = "Deceptive" if t > 60 else "Truth"
            return {"label": label, "score": t, "text_score": t, "audio_score": None, "video_score": None}
        # otherwise likely truthful-ish
        t = random.randint(10, 35)
        return {"label": "Truth", "score": t, "text_score": t, "audio_score": None, "video_score": None}

    # AUDIO-only (simulate prosodic scoring)
    if audio_file:
        a = random.randint(20, 90)
        label = "Deceptive" if a > 55 else "Truth"
        return {"label": label, "score": a, "text_score": None, "audio_score": a, "video_score": None}

    # VIDEO-only (simulate face-motion scoring)
    if video_file:
        v = random.randint(25, 95)
        label = "Deceptive" if v > 55 else "Truth"
        return {"label": label, "score": v, "text_score": None, "audio_score": None, "video_score": v}

    # default fallback
    return {"label": "Truth", "score": 0, "text_score": None, "audio_score": None, "video_score": None}
