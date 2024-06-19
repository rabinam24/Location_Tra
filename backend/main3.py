from main2 import *

# Register the blueprint with the Flask application
app.register_blueprint(main2_bp)


if __name__=="__main__":
    print("This must be either True or False",os.path.exists('dummy'))
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    if not os.path.exists('dummy'):
        os.makedirs('dummy')
    with app.app_context():
        db.create_all()
    # createapp()
    # with app.app_context():
    #     randomize()
    app.run(debug=True)