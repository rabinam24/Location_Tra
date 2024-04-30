import React,{ useState} from "react";

export default function Avatar() {
    const [ avatar, setavatar ] = React.useState();

    const handleClick = () => {
        setavatar(avatar ? null : "https://i.pravatar.cc/300");
    };

    return (
        <div>
            <img
                src={avatar}
                alt="avatar"
                onClick={handleClick}
            />
        </div>
    );
}
