import React from 'react'

const Profile = (props) => {
  return (
    <div className="profile">
      <h1>{props.info.name}</h1>
      <h2>{props.info.title}</h2>
      <p>{props.info.about} </p>
      <div className="hr">
        <br />
        <br />
      </div>
    </div>
  )
}

export default Profile
