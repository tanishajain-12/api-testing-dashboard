from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time

app = Flask(__name__)
CORS(app)  # Allows frontend to connect to this backend

@app.route('/test-api', methods=['POST'])
def test_api():
    data = request.get_json()
    url = data.get('url')         # API URL sent from frontend
    expected_keys = data.get('expected_keys', [])  # Optional schema keys

    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    try:
        start_time = time.time()
        response = requests.get(url, timeout=10)
        end_time = time.time()

        response_time = round((end_time - start_time) * 1000, 2)  # in ms
        status_code = response.status_code
        
        # Try to parse JSON
        try:
            json_data = response.json()
        except:
            json_data = {}

        # Schema validation
        schema_results = []
        for key in expected_keys:
            schema_results.append({
                'key': key,
                'found': key in json_data
            })

        return jsonify({
            'status_code': status_code,
            'response_time_ms': response_time,
            'json_data': json_data,
            'schema_results': schema_results
        })

    except requests.exceptions.Timeout:
        return jsonify({'error': 'Request timed out'}), 504
    except requests.exceptions.ConnectionError:
        return jsonify({'error': 'Could not connect to URL'}), 502
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)