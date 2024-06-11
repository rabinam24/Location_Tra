# from flask import Flask
import base64
from PIL import Image
# from collections import OrderedDict
from collections import OrderedDict

from flask import Flask, request, jsonify
from datetime import datetime

from flask_cors import CORS
from models import UserForm, db

from wtforms import Form,StringField,FloatField,FileField

from werkzeug.utils import secure_filename
import os
import logging
app = Flask(__name__)

CORS(app)  # Enable CORS for all routes
# CORS(app, origins='http://localhost:5173')  # Allow requests only from http://localhost:5173
# import sqlite3
# db.create_all()
# Set up logging
if not os.path.exists('logs'):
    os.makedirs('logs')
logging.basicConfig(filename='logs/form_data.log', level=logging.INFO,
                    format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger()


from flask import send_file,send_from_directory
from werkzeug.utils import safe_join

class submitForm(Form):
    form_location = StringField('Location')
    form_latitude = FloatField('Latitude')
    form_longitude = FloatField('longitude')
    form_selectpole = StringField('SelectPole')
    form_selectpolestatus = StringField('SelectPoleStatus')
    form_selectlocation = StringField('SelectPoleLocation')
    form_description = StringField('Description')
    form_poleimage = FileField('selectpoleimage')

class Student(db.Model):
    roll = db.Column(db.Integer,primary_key=True)
    name = db.Column(db.String(80))

def randomize():
    # Generate SQL code for creating tables
    sql_code = db.Model.metadata.create_all(bind=db.engine)
    print(sql_code)

@app.route('/')
def hello_world():
    directory = 'buildStaticReactVite'
    full_path = safe_join(directory,'hello')
    print(full_path)
    return 'Hello from backend!'

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'jpg', 'jpeg', 'png', 'gif'}


# if __name__ == '__main__':
#     app.run(debug=True)

# # Flask API to handle userform for the frontend react code

# app = Flask(__name__)
# @app.route('/')
# def hello_world():
#     return 'Hello from backend!'


# Configure database (replace with your configuration from config.py or environment variables)

# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:acharya@localhost/test'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# db.init_app(app)  # Initialize database
# print("Database initialized successfully")
app.config['UPLOAD_FOLDER'] = 'uploads'

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
        form_data = request.form
        # form_data = request.json
        # files = request.files['poleimage']
        # files = request.files.getlist('poleimage')
        # test_data2= request.get_json()
        location = form_data.get('location')
        gpslocation = form_data.get('gpslocation').replace(" ","")
        print("Form Data:", form_data)
        # test1 = test_data2.get('location')
        # test2 = test_data2.get('gpslocation')
         # Validate GPS location format
        if gpslocation.count(',') != 1:
            return jsonify({"error": "GPS location must contain exactly two float values separated by a comma"}), 400
        print(location,gpslocation)
        print(type(gpslocation))
        latitude = gpslocation.split(',')[0]
        longitude = gpslocation.split(',')[1]
        print(latitude)
        print(longitude)
        # before typecasting
        print(type(latitude))
        print(type(longitude))
        try:
            latitude_float = float(latitude)
            longitude_float = float(longitude)
        except ValueError:
            return jsonify({"error": "Latitude and longitude must be float values"}), 400
        
        selectpole = form_data.get('selectpole')
        print(selectpole)
        selectpolestatus = form_data.get('selectpolestatus')
        print(selectpolestatus)
        selectpolelocation = form_data.get('selectpolelocation')
        print(selectpolelocation)
        description = form_data.get('description')
        print(description)
        availableisp = form_data.get('availableisp')
        print(availableisp)
        print(type(availableisp))
        saved_files = []
        
        if 'poleimage' in request.files:
            print("yes there is electricPole.jpg")
            print(type(request.files))
            print(type(request.files['poleimage']))
            poleimage = request.files['poleimage']
            filename = poleimage.filename
            content_type = poleimage.content_type
            print(filename,type(filename))
            print(content_type,type(content_type))
            directory = 'dummy'
            file_path = os.path.join(directory, filename)
            print(file_path)
            poleimage.save(file_path)
        else:
            print("no electricPOle.jpg")

        if availableisp.lower() == 'yes':
            selectisp = form_data.get('selectisp')
            ispimages = request.files.getlist('ispimages')
            for particular_isp in ispimages:
                ispfilename = particular_isp.filename
                main_dir = 'dummy'
                sub_dir = selectisp
                ispfilepath = os.path.join(main_dir,sub_dir)
                if not os.path.exists(ispfilepath):
                    os.makedirs(ispfilepath)
                ispfilefullpath = os.path.join(ispfilepath,ispfilename)
                print(ispfilefullpath)
                particular_isp.save(ispfilefullpath)
        elif availableisp.lower() == 'no':
            pass
        else:
            return jsonify({"error":"please enter only yes and no boolean values in availableisp"})
        
        form_data_log = request.form.to_dict()
        file_data_log = request.files.to_dict()
        # Log form data
        logger.info(f"Form data received: {form_data_log}")
        # Log file data (file names and content types)
        for filename_log, file_log in file_data_log.items():
            logger.info(f"File received: {filename_log} (content type: {file_log.content_type})")



        # Save the uploaded files
        # saved_files = []
        # if isinstance(files, list):
        #     for file in files:
        #         if file and allowed_file(file.filename):
        #             filename = secure_filename(file.filename)
        #             file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        #             file.save(file_path)
        #             saved_files.append(file_path)
        # else:
        #     # Handle the case where only one file is uploaded
        #     single_file = files
        #     if single_file and allowed_file(single_file.filename):
        #         filename = secure_filename(single_file.filename)
        #             file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        #             file.save(file_path)
        #             saved_files.append(file_path)
        
        # for file in files:
        #     if file and allowed_file(file.filename):
        #         filename = secure_filename(file.filename)
        #         file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        #         file.save(file_path)
        #         saved_files.append(file_path)
        # filename = "rgb.jpg"
        # directory = 'dummy'
        # img = Image.new('RGB', (100, 100), color = 'red')
        # file_path = os.path.join(directory, filename)
        # img.save(file_path)


        # Check if the Latitude and Longitude values are in between the Range for Nepal
        # The latitude and longitude range for Nepal is approximately:
        # Latitude: 26.3475° N to 30.4474° N
        # Longitude: 80.0580° E to 88.2015° E
        if not (26.3475 <= latitude_float <= 30.4474 and 80.0580 <= longitude_float <= 88.2015):
            return jsonify({"error": "Latitude and Longitude values must be within the range for Nepal"}), 400

        print(latitude_float)
        print(longitude_float)
        print(type(latitude_float))
        print(type(longitude_float))
        with open(file_path,'rb') as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            print(encoded_string)
            # print(encoded_string)
        submit_location: str = location
        submit_latitude: float = latitude_float
        submit_longitude: float = longitude_float
        submit_selectpole: str = selectpole
        submit_selectpolestatus: str = selectpolestatus
        submit_selectpolelocation: str = selectpolelocation
        submit_description: str = description
        submit_poleimage: str = str(encoded_string)
        submit_poleimagename: str = str(filename)

        submit_data = {
            'location':submit_location,
            'latitude':submit_latitude,
            'longitude':submit_longitude,
            'selectpole':submit_selectpole,
            'selectpolestatus':submit_selectpolestatus,
            'selectpolelocation':submit_selectpolelocation,
            'description':submit_description,
            'poleimage':submit_poleimage,
            'poleimagename':submit_poleimagename
        }


        form_object = submitForm(data=submit_data)

        if form_object.validate():
            print("form submission successful")
            print("yahoo!")
            unordered_data = {"form_submission_success":True,"selectpole":selectpole,"selectpolestatus":selectpolestatus,"location":submit_data['location'],"latitude":submit_data['latitude'],"longitude":submit_data['longitude'],"description":description,"poleimage":str(encoded_string),"poleimagename":str(filename),"message": "Form data logged successfully"}

            # response_data = OrderedDict([
            #     ("form_submission_success", True),
            #     ("location", submit_data['location']),
            #     ("latitude", submit_data['latitude']),
            #     ("longitude", submit_data['longitude']),
            #     ("description", description),
            #     ("selectpole", selectpole),
            #     ("selectpolestatus", selectpolestatus),
            #     ("poleimage", str(encoded_string)),
            #     ("poleimagename", str(filename)),
            #     ("message":"Form data logged successfully")
            # ])

            response_data = OrderedDict([
                ("form_submission_success", True),
                ("location", submit_data['location']),
                ("latitude", submit_data['latitude']),
                ("longitude", submit_data['longitude']),
                ("description", description),
                ("selectpole", selectpole),
                ("selectpolestatus", selectpolestatus),
                ("poleimage", str(encoded_string)),
                ("poleimagename", str(filename)),
                ("message", "Form data logged successfully")
            ])


            # response_data_sorted = dict(sorted(response_data.items(), key=lambda item: item[0]))

            # return jsonify(response_data_sorted), 200

            return jsonify(dict(response_data)), 200

            # return jsonify(response_data),200
        else:
            all_errors = {field: error[0] for field, error in form_object.errors.items()}
            print("form submission not successful")
            return jsonify({"form_submission_success":False,"errors":all_errors}), 400
        

        # commenting the below code for now
        # return jsonify({"location":f"{test1}","gpslocation":f"{test2}","description":"empty"})
        # return "hahahha"


@app.route('/start_trip',methods=['POST'])
def start_trip():
     # Assuming the frontend sends the current user's name
    # current_user = request.json.get('current_user')
    # Get the current time as the trip start time
    start_time = datetime.now()
    print(start_time)
    # Return the trip start time as a response
    start_time_formatted = start_time.strftime('%Y-%m-%d %H:%M:%S')
    print(start_time_formatted)
    print(f"started : True, startTime: {start_time_formatted}")
    return jsonify({'started': True, 'startTime': start_time_formatted})





# @app.route('/static/<path:pathLocation>')
# def serve_static(pathLocation):
#     return send_file(f'buildStaticReactVite/{pathLocation}')


print(app.url_map)
if __name__ == '__main__':
    print("This must be either True or False",os.path.exists('dummy'))
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    if not os.path.exists('dummy'):
        os.makedirs('dummy')
    # with app.app_context():
    #     randomize()
    app.run(debug=True)
