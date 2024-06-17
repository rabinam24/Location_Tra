# from flask import Flask
# from flask_sqlalchemy import SQLAlchemy
# from flask_cors import CORS

# app = Flask(__name__)
# CORS(app)

# # SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:acharya@localhost/test'  # Replace with your database URL
# # SQLALCHEMY_TRACK_MODIFICATIONS = False  # Recommended for performance

# # app.config["SQLALCHEMY_DATABASE_URI"]='postgresql://postgres:acharya@localhost/test'
# # app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
# app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///test.db"
# app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# db = SQLAlchemy(app)

# Database configrations for main2.py file app
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///mydatabase2.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)