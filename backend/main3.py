from flask import Flask
from main2 import main2_bp

app = Flask(__name__)

# Register the blueprint with the Flask application
app.register_blueprint(main2_bp)

def createapp():
    return ModuleNotFoundError
    # pass
    # return None
