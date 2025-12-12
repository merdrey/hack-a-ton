import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv, dotenv_values
from gigachat import GigaChat
import requests
import json

load_dotenv()

app = Flask(__name__)
CORS(app)

giga = GigaChat(credentials=os.getenv("GIGACHAT_CREDENTIALS"), verify_ssl_certs=os.getenv("GIGACHAT_VERIFY_SSL_CERTS"))

def gen_cw(topic):
  prompt = f"""
      Ты помощник для генерации кроссвордов.

      Задача: создай список слов для кроссворда на тему "{topic}".

      Требования:
      - Количество слов: 10
      - Максимальная длина слова: 15 букв
      - Все слова должны быть на русском языке
      - Слова должны быть существительными в именительном падеже
      
      Формат вывода (каждое слово с новой строки):
      СЛОВО|ОПРЕДЕЛЕНИЕ

      Пример:
      ПИТОН|язык программирования
      АЛГОРИТМ|последовательность шагов для решения задачи

      Сгенерируй слова и определения (НИЧЕГО БОЛЕЕ НЕ ДОЛЖНО БЫТЬ В ВЫВОДЕ):
      """

  try:
    response = giga.chat(prompt)
    return response.choices[0].message.content

  except Exception as e:
    print(f"GigaChat error: {e}")
    return ""

def gen_ans(raw_text):
  words = []
  for line in raw_text.strip().split('\n'):
    line = line.strip()
    if '|' in line:
      word, definition = line.split('|', 1)
      word = word.lower().strip()
      definition = definition

      words.append({
        'clue': definition,
        'answer': word
      })

  return words

@app.route('/api/generate', methods = ['GET'])
def get_cw():
  try:
    theme = request.args.get("theme")

  except Exception as e:
    return jsonify({
      'success': False,
      'error': str(e),
      'message': 'Internal server error'
    }), 500

  response = gen_cw(theme)
  print(response)
  words = gen_ans(response)
  print(words)
  json_words = json.dumps(words)
  return json_words

if __name__ == '__main__':
  app.run(debug=True)