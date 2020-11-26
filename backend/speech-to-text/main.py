"""
Requirements:
    Python
    pip
    Swig
    pocketsphinx
    google-cloud-speech
    google-api-python-client
    SpeechRecognition
"""
    
import speech_recognition as sr

## Takes in the file path and returns the best
## prediction by google cloud speech recognition
## API. In case that doesn't work, returns
## a (much worse) prediction by CMUSphinx
def recognize(audio_file: str)->str:
    r = sr.Recognizer()
    with sr.AudioFile(audio_file) as src:
        audio = r.record(src)
    
    def fallback(audio):
        try:
            fallback_pred = r.recognize_sphinx(audio, language="en-US")
        except sr.UnknownValueError:
            print("Sphinx could not understand audio")
            fallback_pred = ""
        except sr.RequestError as e:
            print("Sphinx error; {0}".format(e))
            fallback_pred = ""
        return fallback_pred
        
    # recognize speech using Google Speech Recognition
    try:
        # for testing purposes, we're just using the default API key
        # to use another API key, use `r.recognize_google(audio, key="GOOGLE_SPEECH_RECOGNITION_API_KEY")`
        # instead of `r.recognize_google(audio)`
        google_pred = r.recognize_google(audio, language="en-UK")
        return google_pred
    except sr.UnknownValueError:
        print("Google Speech Recognition could not understand audio")
        return fallback(audio)
    except sr.RequestError as e:
        print("Could not request results from Google Speech Recognition service; {0}".format(e))
        return fallback(audio)
