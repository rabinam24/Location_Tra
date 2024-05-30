import React from "react";
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
        userInfo={userInfo} 
        setUserInfo={setUserInfo}
        allInfo={allInfo}
        setAllInfo={setAllInfo}
        setEditContent={setEditContent}
        editContent={editContent}
      />
     
    </div>
  );
};

export default Home;
