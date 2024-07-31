from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///testing.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
# db.init_app(app)
# You can run this to create the database file, but it won't contain any tables.
# db.create_all()

# if __name__ == "__main__":
    # with app.app_context():
    #     db.create_all()
if __name__ == "__main__":
    try:
        with app.app_context():
            db.create_all()
        print("Database created successfully.")
    except Exception as e:
        print("An error occurred while creating the database:", e)
    app.run(debug=True)

