# from flask import Flask

from flask import Flask, request, jsonify


from flask_cors import CORS
from models import UserForm, db


app = Flask(__name__)

CORS(app)  # Enable CORS for all routes

@app.route('/')
def hello_world():
    return 'Hello from backend!'

# if __name__ == '__main__':
#     app.run(debug=True)

# # Flask API to handle userform for the frontend react code

# app = Flask(__name__)
# @app.route('/')
# def hello_world():
#     return 'Hello from backend!'


# Configure database (replace with your configuration from config.py or environment variables)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:acharya@localhost/test'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)  # Initialize database
print("Database initialized successfully")

# @app.route('/submit-user-form', methods=['POST'])
# @app.route('/form2',methods=['GET'])
# def form2():
#     data = request.args
    # try:
        # Get form data from request.form
        # location = request.form.get('location')
        # gpslocation = request.form.get('gpslocation')
        # selectpool = request.form.get('selectpool')
        # selectpoolstatus = request.form.get('selectpoolstatus')
        # selectpoollocation = request.form.get('selectpoollocation')
        # description = request.form.get('description')
        # poolimage = request.form.get('poolimage')  # Assuming image path is sent
        # availableisp = request.form.get('availableisp')
        # selectisp = request.form.get('selectisp')
        # multipleimages = request.form.get('multipleimages')  # Assuming comma-separated image paths
        # form_data = request.json

        # Validate and process data (optional)
        # ...

        # Create a new user form object
        # new_form = UserForm(
        #     location=location,
        #     gpslocation=gpslocation,
        #     selectpool=selectpool,
        #     selectpoolstatus=selectpoolstatus,
        #     selectpoollocation=selectpoollocation,
        #     description=description,
        #     poolimage=poolimage,
        #     availableisp=availableisp,
        #     selectisp=selectisp,
        #     multipleimages=multipleimages,
        # )
        #  new_form = UserForm(
        #     location=location,
        #     gpslocation=gpslocation,
        #     selectpool=selectpool,
        #     selectpoolstatus=selectpoolstatus,
        #     selectpoollocation=selectpoollocation,
        #     description=description,
        #     poolimage=poolimage,
        #     availableisp=availableisp,
        #     selectisp=selectisp,
        #     multipleimages=multipleimages,
        # )

        # Add the form to the database and commit changes
        # db.session.add(new_form)
        # db.session.commit()
        # return 'submit-form-data'

        # return jsonify({'message': 'User form submitted successfully'}), 201

    # except Exception as e:
    #     print(f"Error processing user form: {e}")
    #     return jsonify({'error': 'An error occurred'}), 500
    # return data

# @app.route('/bibash')
# def bibash():
#     return 'Bibash Acharya'
7

# @app.route('/form2',methods=['POST'])
# def form2():
#     data = request.json
#     return data


@app.route('/submit-user-form', methods=['GET', 'POST'])
def submit_user_form():
    if request.method == 'GET':
        data = request.args
        data2 = data.to_dict()
        data3 = {
            "empty": "nothing in here"
        }
        combined = {**data2,**data3}
        return jsonify(combined)
        # return jsonify(data)
        # location =  request.args.get('location')

        return data
   
    elif request.method == 'POST':
        form_data = request.json
        test_data2= request.get_json()
        location = form_data.get('location')
        gpslocation = form_data.get('gpslocation')
        test1 = test_data2.get('location')
        test2 = test_data2.get('gpslocation')
        print(location,gpslocation)
        return jsonify({"location":f"{test1}","gpslocation":f"{test2}"})
        # return "hahahha"

    

print(app.url_map)
if __name__ == '__main__':
    app.run(debug=True)
