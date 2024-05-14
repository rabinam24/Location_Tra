from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello from backend!'

# if __name__ == '__main__':
#     app.run(debug=True)

# # Flask API to handle userform for the frontend react code

from flask import Flask, request, jsonify
from flask_cors import CORS
from models import UserForm, db

# app = Flask(__name__)
# @app.route('/')
# def hello_world():
#     return 'Hello from backend!'
CORS(app)  # Enable CORS for all routes

# Configure database (replace with your configuration from config.py or environment variables)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:acharya@localhost/test.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)  # Initialize database
print("Database initialized successfully")

@app.route('/submit-user-form', methods=['POST'])
def submit_user_form():
    try:
        # Get form data from request.form
        location = request.form.get('location')
        gpslocation = request.form.get('gpslocation')
        selectpool = request.form.get('selectpool')
        selectpoolstatus = request.form.get('selectpoolstatus')
        selectpoollocation = request.form.get('selectpoollocation')
        description = request.form.get('description')
        poolimage = request.form.get('poolimage')  # Assuming image path is sent
        availableisp = request.form.get('availableisp')
        selectisp = request.form.get('selectisp')
        multipleimages = request.form.get('multipleimages')  # Assuming comma-separated image paths

        # Validate and process data (optional)
        # ...

        # Create a new user form object
        new_form = UserForm(
            location=location,
            gpslocation=gpslocation,
            selectpool=selectpool,
            selectpoolstatus=selectpoolstatus,
            selectpoollocation=selectpoollocation,
            description=description,
            poolimage=poolimage,
            availableisp=availableisp,
            selectisp=selectisp,
            multipleimages=multipleimages,
        )

        # Add the form to the database and commit changes
        db.session.add(new_form)
        db.session.commit()

        return jsonify({'message': 'User form submitted successfully'}), 201

    except Exception as e:
        print(f"Error processing user form: {e}")
        return jsonify({'error': 'An error occurred'}), 500

if __name__ == '__main__':
    app.run(debug=True)
