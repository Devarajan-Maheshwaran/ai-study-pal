from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/api/ping", methods=["GET"])
def ping():
    return jsonify({"status": "ok", "message": "AI Study Pal backend is running"})

if __name__ == "__main__":
    app.run(debug=True)