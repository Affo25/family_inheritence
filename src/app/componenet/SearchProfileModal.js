import React from 'react'
import { FaBeer  } from "react-icons/fa";


function SearchProfileModal({currentPersons,loading=false,isEditMode=false,searchQuery="",handlePageClick,handleSearchChange,offset=0,close,handleSelectPerson,clearList}) {
  return (
  <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
  <div className="modal-dialog modal-xl" role="document">
    <div style={{position:"fixed",width:"70%"}} className="modal-content">
      <div className="modal-header bg-primary">
        <h5 className="modal-title text-white">
        Select Users Modal
        </h5>
        <button
          style={{ color: "#fff" }}
          type="button"
          className="close"
          onClick={close}
          aria-label="Close"
        >
          <em className="icon ni ni-cross-sm"></em>
        </button>
      </div>

      <div className="modal-body" style={{ maxHeight: "80vh", overflowY: "auto" }}>
        <div className="mb-3 d-flex justify-content-between align-items-center">
          {/* <h5 className="mb-0">
            Total Persons
            <span className="badge badge-info ml-2">{20}</span>
          </h5> */}
         <div className="col-md-6">
  <div className="input-group">
    <input
      type="text"
      className="form-control"
      placeholder="Search persons by CNIC, name or email..."
      value={searchQuery}
      onChange={handleSearchChange}
    />
    <div className="input-group-append">
      <button className="btn btn-primary" type="button" onClick={handleSearchChange}>
        <i className="bi bi-search"></i> Search
      </button>
    </div>
  </div>
</div>

        </div>

        <div className='Container'>
            <div className="table-responsive">
          <table className="table table-hover table-bordered table-striped">
            <thead className="thead-dark text-center" style={{ fontSize: "14px" }}>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>CNIC</th>
                <th>Birthplace</th>
                <th>Birthdate</th>
                <th>Marital Status</th>
                <th>Blood Group</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody style={{ fontFamily: "Segoe UI" }}>
              {loading ? (
                <tr>
                  <td colSpan="11" className="text-center">
                    <div className="spinner-border text-secondary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : currentPersons.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center">No persons found</td>
                </tr>
              ) : (
                currentPersons.map((person, index) => (
                  <tr key={person._id}>
                    <td>{offset + index + 1}</td>
                    <td>{person.first_name} {person.last_name}</td>
                    <td>{person.email}</td>
                    <td>{person.contact}</td>
                    <td>{person.cnic}</td>
                    <td><span className="badge badge-success">{person.birth_place}</span></td>
                    <td><span className="badge badge-info">{new Date(person.birth_date).toLocaleDateString()}</span></td>
                    <td><span className="badge badge-info">{person.marital_status}</span></td>
                    <td><span className="badge badge-primary">{person.blood_group}</span></td>
                    <td>
                      <span className={`badge badge-${person.alive ? 'success' : 'danger'}`}>
                        {person.alive ? 'Alive' : 'Deceased'}
                      </span>
                    </td>
                    <td className="text-center">
                     <button     onClick={() => handleSelectPerson(person)}
 style={{width:"50px"}} className="btn btn-success btn-sm mr-1">
                     <i style={{width:"30px"}} className='icon ni ni-check-circle'></i>
                     </button>
                     <button onClick={()=>clearList()} style={{width:"50px"}} className="btn btn-danger btn-sm mr-1">
                     <i style={{width:"30px"}} className='icon ni ni-cross-circle'></i>
                     </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  </div>
</div>

  )
}

export default SearchProfileModal