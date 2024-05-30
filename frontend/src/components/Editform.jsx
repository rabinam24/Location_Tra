
import React, { useState } from 'react';

const EditForm = ({ editContent, setEditContent, setEdit, allInfo, setAllInfo }) => {
  const [formContent, setFormContent] = useState(editContent);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormContent((prevContent) => ({ ...prevContent, [name]: value }));
  };

  const handleEdit = (e) => {
    e.preventDefault();
    const updatedInfo = allInfo.map((info) =>
      info.id === formContent.id ? formContent : info
    );
    setAllInfo(updatedInfo);
    setEdit(false);
  };

  return (
    <div>
      <form className="edit-form">
        <div className="edit-form-item">
          <label htmlFor="location">
            Location <span className="required-symbol">*</span>
          </label>
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={editContent.location}
            required
            onChange={handleChange}
          />
        </div>

        <div className="edit-form-item">
          <label htmlFor="gpslocation">
            GPS Location <span className="required-symbol">*</span>
          </label>
          <input
            type="text"
            name="gpslocation"
            placeholder="GpsLocation"
            value={editContent.gpslocation}
            required
            onChange={handleChange}
          />
        </div>

        <button
          type="button"
          onClick={() => {
            navigator.geolocation.getCurrentPosition((position) => {
              const location = `${position.coords.latitude}, ${position.coords.longitude}`;
              setEditContent((prevContent) => ({
                ...prevContent,
                gpslocation: location,
              }));
            });
          }}
        >
          Get GPS Location
        </button>

        <div className="edit-form-item">
          <label htmlFor="selectpole">
            Select pole <span className="required-symbol">*</span>
          </label>
          <select
            name="selectpole"
            value={editContent.selectpole}
            required
            onChange={handleChange}
            style={{
              margin: "8px 0",
              borderRadius: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              transition: "border-color 0.3s ease-in-out",
            }}
          >
            <option value="">Select pole </option>
            <option value="Concrite Square pole"> Concrite Square pole</option>
            <option value="Concrite Round pole"> Concrite Round pole</option>
            <option value="Metal pole"> Metal pole</option>
            <option value="Wooden pole"> Wooden pole</option>
            <option value="Bamboo pole"> Bamboo pole</option>
          </select>
        </div>

        <div className="edit-form-item">
          <label htmlFor="selectpolestatus">
            Select pole Status<span className="required-symbol">*</span>
          </label>
          <select
            name="selectpolestatus"
            value={editContent.selectpolestatus}
            required
            onChange={handleChange}
            style={{
              margin: "8px 0",
              borderRadius: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              transition: "border-color 0.3s ease-in-out",
            }}
          >
            <option value="">Select pole Status</option>
            <option value="In Great Condition"> In Great Condition</option>
            <option value="In Moderate Condition">
              {" "}
              In Moderate Condition
            </option>
            <option value="In Bad Condition"> In Bad Condition</option>
          </select>
        </div>

        <div className="edit-form-item">
          <label htmlFor="selectpolelocation">
            Select pole Location <span className="required-symbol">*</span>
          </label>
          <select
            name="selectpolelocation"
            value={editContent.selectpolelocation}
            required
            onChange={handleChange}
            style={{
              margin: "8px 0",
              borderRadius: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              transition: "border-color 0.3s ease-in-out",
            }}
          >
            <option value="">Select pole Location</option>
            <option value="Near House"> Near House</option>
            <option value="Inside House"> Inside House</option>
            <option value="No House NearBy"> No House NearBy</option>
            <option value="In Open Space"> In Open Space</option>
          </select>
        </div>

        <div className="edit-form-item">
          <label htmlFor="description">Description </label>
          <textarea
            name="description"
            placeholder="Description"
            value={editContent.description}
            onChange={handleChange}
            style={{
              margin: "8px 0",
              minHeight: "100px",
              borderRadius: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              transition: "border-color 0.3s ease-in-out",
            }}
            onFocus={(e) => (e.target.style.border = "1px solid #337ab7")}
            onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
          />
        </div>

        <div className="edit-form-item">
          <label htmlFor="image">pole Image </label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            style={{
              margin: "8px 0",
              borderRadius: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              transition: "border-color 0.3s ease-in-out",
            }}
            onFocus={(e) => (e.target.style.border = "1px solid #337ab7")}
            onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
          />
        </div>

        <div className="edit-form-item">
          <label htmlFor="Available ISP">
            Available ISP <span className="required-symbol">*</span>
          </label>
          <div>
            <input
              type="radio"
              name="availableisp"
              value="Yes"
              checked={editContent.availableisp === "Yes"}
              onChange={handleChange}
              style={{
                margin: "8px 0",
                borderRadius: "10px",
                padding: "10px",
                border: "1px solid #ccc",
                transition: "border-color 0.3s ease-in-out",
              }}
            />
            <label htmlFor="availableisp">Yes</label>
            <input
              type="radio"
              name="availableisp"
              value="No"
              checked={editContent.availableisp === "No"}
              onChange={handleChange}
            />
            <label htmlFor="availableisp">No</label>
          </div>
        </div>

        {/* Show detailed image input only when 'availableisp' is 'Yes' */}
        {editContent.availableisp === "Yes" && (
          <div className="edit-form-item">
            <label htmlFor="selectisp">
              Select ISP <span className="required-symbol">*</span>
            </label>

            <select
              name="selectisp"
              value={editContent.selectisp}
              required
              onChange={handleChange}
              style={{
                margin: "8px 0",
                borderRadius: "10px",
                padding: "10px",
                border: "1px solid #ccc",
                transition: "border-color 0.3s ease-in-out",
              }}
            >
              <option value="">Select ISP</option>
              <option value="World Link">WorldLink</option>
              <option value="Nepal Telecom">Nepal Telecom</option>
              <option value="Vianet">Vianet</option>
              <option value="ClaasicTech">ClassicTech</option>
              <option value="Subisu">Subisu</option>
              {/* Add more options as needed */}
            </select>

            <label htmlFor="multipleimage">
              Multiple Images <span className="required-symbol">*</span>{" "}
            </label>
            <input
              multiple
              type="file"
              name="multipleimages"
              onChange={handleChange}
              style={{
                margin: "8px 0",
                borderRadius: "10px",
                padding: "10px",
                border: "1px solid #ccc",
                transition: "border-color 0.3s ease-in-out",
              }}
            />
          </div>
        )}
      </form>

      <button type="submit" className="update-button" onClick={handleEdit}>
        Update
      </button>
    </div>
  );
};

export default EditForm;
