from flask import Flask, request, jsonify
from flask_cors import CORS  # Importez le module Flask-CORS
import speech_recognition as sr
import openai

app = Flask(__name__)
CORS(app)  # Activez CORS pour l'application Flask
CORS(app, resources={r"/reconnaissance-vocale": {"origins": "http://127.0.0.1:5500"},r"/generer-texte": {"origins": "http://127.0.0.1:5500"}})


# Configuration de la clé API OpenAI
openai.api_key = "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"
@app.route('/generer-texte', methods=['POST'])
def generer_texte():
    data = request.get_json()
    prompt = data.get('prompt')

    if not prompt:
        return jsonify({'error': 'Paramètre "prompt" manquant'}), 400

    response = openai.Completion.create(
        engine="text-davinci-002",
        prompt=prompt,
        max_tokens=50  # Le nombre de tokens de sortie souhaité
    )

    return jsonify({'texte_genere': response.choices[0].text})

recognizer = sr.Recognizer()


@app.route('/reconnaissance-vocale', methods=['POST'])
def reconnaissance_vocale():
    try:
        with sr.Microphone() as source:
            print("Dites quelque chose...")
            audio = recognizer.listen(source)
            texte_reconnu = recognizer.recognize_google(audio, language="en-EN")  # Remplacez "fr-FR" par la langue de votre choix
            return jsonify({'texte_reconnu': texte_reconnu})
    except sr.UnknownValueError:
        return jsonify({'error': 'Impossible de reconnaître la parole'})
    except sr.RequestError:
        return jsonify({'error': 'Erreur lors de la requête au service de reconnaissance'})

if __name__ == '__main__':
    app.run(debug=True)

