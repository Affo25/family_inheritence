import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import ReactPaginate from 'react-paginate';

function PersonDataTable({
  currentPersons,
  persons,
  loading = false,
  searchQuery = "",
  offset = 0,
  personsPerPage = 10,
  filteredPersons = [],
  handleSearchChange = () => {},
  handlePageClick = () => {},
  openDeleteModal = () => {},
  handleEdit = () => {},
}) {
  return (
    <div className="row pt-3">
      <div className="col-12">
        <div className="card card-bordered card-preview">
          <div className="card-inner-group">
            <div className="card-inner">
              <div className="card-title-group d-flex justify-content-between align-items-center">
                <div className="card-title">
                  <h5 className="title">
                    Total Persons Recorded:
                    <span className="badge badge-info ml-2">{persons.length}</span>
                  </h5>
                </div>
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search persons..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
            </div>

            <div className="card-inner p-0 table-responsive">
              <table className="table table-hover nowrap align-middle dataTable-init">
                <thead style={{ fontSize: "14px", fontWeight: 'bold' }} className="tb-tnx-head">
                  <tr>
                    <th scope="col">#</th>
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
                <tbody style={{ fontFamily: "Segoe UI" }} className="tb-tnx-body">
                  {loading ? (
                    <tr>
                      <td colSpan="11" className="text-center">
                        <span className="spinner-border text-secondary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </span>
                      </td>
                    </tr>
                  ) : currentPersons.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="text-center">No persons found</td>
                    </tr>
                  ) : (
                    currentPersons.map((person, index) => (
                      <tr key={person._id}>
                        <td><b>{offset + index + 1}</b></td>
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
                          <Dropdown>
                            <Dropdown.Toggle variant="light-grey" id="dropdown-basic">
                              <em style={{ color: "black" }} className="icon ni ni-more-h"></em>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="dropdown-menu dropdown-menu-top-center dropdown-menu-xs">
                              <Dropdown.Item>
                                <em className="icon ni ni-eye mr-2"></em> View
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleEdit(person)}>
                                <em className="icon ni ni-pen mr-2"></em> Edit
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => openDeleteModal(person)}>
                                <em className="icon ni ni-trash mr-2"></em> Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <ReactPaginate
                previousLabel={"Previous"}
                nextLabel={"Next"}
                pageCount={Math.ceil(filteredPersons.length / personsPerPage)}
                onPageChange={handlePageClick}
                containerClassName={"pagination justify-content-end"}
                pageClassName={"page-item"}
                pageLinkClassName={"page-link"}
                previousClassName={"page-item"}
                previousLinkClassName={"page-link"}
                nextClassName={"page-item"}
                nextLinkClassName={"page-link"}
                activeClassName={"active"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PersonDataTable;
