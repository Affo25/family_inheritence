
"use client";

import React from "react";

const UserCard = ({singlePerson},person_info) => {
    // Use person_info if provided, otherwise use person
    const profile = person_info || singlePerson;
    if (!profile) return null; // Return nothing if profile is not set
  return (
    <div style={{ width: '260px', height: '415px', border: '1px solid #d6d6d6',backgroundColor:"white",marginBottom:"2rem"}}  className="card card-bordered">
      <div className="card-inner">
        <div className="team">
          {/* <div className="team-status bg-danger text-white">
            <em className="icon ni ni-na"></em>
          </div> */}
          <div className="user-card user-card-s2">
           <img
                              src={profile.image}
                              alt={`${profile.first_name} ${profile.last_name}`}
                              style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '50%' }}
                            />
            <div className="user-info">
              <h6>{profile.first_name || ''} {profile.last_name || ''}</h6>
              <span className="sub-text">{profile.email || '@user'}</span>
            </div>
          </div>
          <div className="team-details">
            <p>{profile.pid || profile.description || 'No additional information available.'}</p>
            {profile.contact && <p><strong>Contact:</strong> {profile.contact}</p>}
            {profile.gender && <p><strong>Gender:</strong> {profile.gender}</p>}
          </div>
          <ul className="team-statistics">
            <li>
              <span>{profile.status || 'N/A'}</span>
              <span>Status</span>
            </li>
            <li>
              <span>{profile.blood_group || 'N/A'}</span>
              <span>Blood Group</span>
            </li>
            <li>
              <span>{profile.cnic || 'N/A'}</span>
              <span>CNIC</span>
            </li>
          </ul>
           <button type="submit" className="btn btn-primary w-100 justify-center"  onClick={(e) => {
                e.preventDefault();
                // You can add additional click handler logic here if needed
                console.log('Profile selected:', profile);
              }}>
                                    
                                      <div className="d-flex justify-content-center">
                                        
                                      </div>
                                    
                                      <span>View Profile</span>
                                    
                                  </button>
          {/* <div style={{backgroundColorderTop:'1px solid black',paddingTop:"3rem"}} className="team-view">
            <a 
              href={profile._id ? `#profile-${profile._id}` : '#'} 
              className="btn btn-round btn-outline-light w-150px"
              onClick={(e) => {
                e.preventDefault();
                // You can add additional click handler logic here if needed
                console.log('Profile selected:', profile);
              }}
            >
              <span>View Profile</span>
            </a>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default UserCard;