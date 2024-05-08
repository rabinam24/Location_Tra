import React, { useState } from "react";
import "../Profile.css";
import EditForm from "../components/Editform.jsx";


const Profile = ({ allInfo, editContent, setAllInfo, setEditContent }) => {
  document.title = "Profiles";
  const [edit, setEdit] = useState(false);

  const toggleEdit = (id) => {
    const info = allInfo.find((info) => info.id === id);
    setEditContent(info);
    setEdit(true);
    console.log(editContent);
  };

  const handleDelete = (id) => {
    const updatedInfo = allInfo.filter((info) => info.id!== id);
    setAllInfo(updatedInfo);
  };

  return (
    <div className="profile-container">
      <h1 className="profile-heading">Pool Profiles</h1>
      <ul className="profile-list">
        {allInfo.map((inf) => (
          <li key={inf.id} className="profile-item">
            <div className="profile-labels">
              <span>Location:</span> {inf.location} <br />
              <span>Gps Location:</span> {inf.gpslocation} <br />
              <span>ISP:</span> {inf.selectisp} <br />
              <span>Description:</span> {inf.description} <br />  
              <span>Pool Status:</span> {inf.selectpoolstatus} <br />
              <span>Pool Type:</span> {inf.selectpool} <br />
              <span>Pool Location:</span> {inf.selectpoollocation} <br />
              <span>Created At:</span> {inf.createdAt} <br />
            </div>
            <div className="profile-actions">
              <button className="edit-button" onClick={() => toggleEdit(inf.id)}>Edit</button>
              <button className="delete-button" onClick={() => handleDelete(inf.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {edit? (
        <EditForm
          allInfo={allInfo}
          editContent={editContent}
          setAllInfo={setAllInfo}
          setEditContent={setEditContent}
          edit={edit}
          setEdit={setEdit}
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default Profile;