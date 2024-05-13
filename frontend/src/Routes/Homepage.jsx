import React from "react";
import Form from "../components/FormInput";
import List from "../components/ListInfo";

const Home = ({
  userInfo,
  setUserInfo,
  allInfo,
  setAllInfo,
  editContent,
  setEditContent,
}) => {
  return (
    <div>
      <List
        userInfo={userInfo} // Make sure userInfo is passed here
        setUserInfo={setUserInfo}
        allInfo={allInfo}
        setAllInfo={setAllInfo}
      />
      {/* <List
        userInfo={userInfo}
        allInfo={allInfo}
        setAllInfo={setAllInfo}
        editContent={editContent}
        setEditContent={setEditContent}
      /> */}
    </div>
  );
};

export default Home;
