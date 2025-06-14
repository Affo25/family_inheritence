import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import Dropdown from 'react-bootstrap/Dropdown';
import Pagination from "../componenet/pagination";
import SearchUserProfileModal from "../componenet/serachUserRecordModal";
import usePersonStore from '../stores/profile_stores';

function PersonDataTable({
  currentPersons,
  loading = false,
  searchQuery = "",
  offset = 0,
  personsPerPage = 10,
  status = "",
  pagination,
  filteredPersons = [],
  handleSearchChange = (event) => {},
  handlePageClick = (event) => {},
  handlePageChange = (event) => {},
  openDeleteModal = (event) => {},
  handleEdit = (event) => {},
  clodeModal = (event) => {},
}) {
  const router = useRouter();

  const [searchProfile, setSearchProfile] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [refreshToggle, setRefreshToggle] = useState(false);


 // ✅ Zustand subscription for reactive updates
 const persons = usePersonStore(state => state.persons); // this creates subscription
  const setPersons = usePersonStore(state => state.setPersons); // ✅ use store action directly

  const closeSearchModal = (profiles) => {
    console.log("before set filter record", profiles);
    setPersons(profiles); // ✅ use store action directly
    console.log("after get filter record", usePersonStore.getState().persons);
    setSearchProfile(false);
    // setIsSearchMode(false);
     setSearchResults([]);
  };

  const openSearchModal = () => {
    setIsSearchMode(true);
    setSearchProfile(true);
  };

 

  const onFilteredResult = (result) => {
    if (Array.isArray(result) && result.length > 0) {
      setSearchResults(result);
      setIsSearchMode(true);
    } else {
      setSearchResults([]);
      setIsSearchMode(false);
    }
    setSearchProfile(false);
  };

  const FatherpersonMap = new Map(
    persons.map(p => [p.father_id, `${p.first_name} ${p.last_name}`])
  );

  const personMap = new Map(
    persons.map(p => [p.mother_id, `${p.first_name} ${p.last_name}`])
  );

  const gotoUserDetail = async (userId) => {
    if (!userId) return;
    try {
      router.push(`/Dashboard/PersonDetails/${userId}`);
    } catch (error) {
      console.error('Navigation failed:', error);
      router.push('/error?type=navigation_failed');
    }
  };

 const clearSearch = () => {
    setSearchTerm("");
    setFilteredPersons(persons.filter(person => person.status === status));
    setIsSearchMode(false);
  };


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
                    <span className="badge badge-info ml-2">
                      {filteredPersons.filter(person => person.status === status).length}
                    </span>
                  </h5>
                </div>
                <div className="d-flex align-items-center">
                  <div className="card-tools mr-n1">
                    <ul className="btn-toolbar">
                      <li>
                        <a onClick={openSearchModal} className="btn btn-icon search-toggle toggle-search">
                          <em className="icon ni ni-search"></em>
                        </a>
                      </li>
                      <li className="btn-toolbar-sep"></li>
                      <li>
                        <div className="dropdown">
                          <a href="javascript:void(0)" className="btn btn-trigger btn-icon dropdown-toggle">
                            <em className="icon ni ni-setting"></em>
                          </a>
                          <div className="dropdown-menu dropdown-menu-right dropdown-menu-xs">
                            <ul className="link-check">
                              <li><span>Show</span></li>
                              <li><a href="#">10</a></li>
                              <li><a href="#">20</a></li>
                              <li><a href="#">50</a></li>
                            </ul>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-inner p-0 table-responsive">
              <table className="table table-hover nowrap align-middle dataTable-init">
                <thead style={{ fontSize: "14px", fontWeight: 'bold' }} className="tb-tnx-head">
                  <tr>
                    <th>#</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Father</th>
                    <th>Mother</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>CNIC</th>
                    <th>GENDER</th>
                    <th>Birthplace</th>
                    <th>Birthdate</th>
                    <th>Status</th>
                    <th>Marital Status</th>
                    <th>Blood Group</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody style={{ fontFamily: "Segoe UI" }} className="tb-tnx-body">
                  {loading ? (
                    <tr>
                      <td colSpan="16" className="text-center">
                        <span className="spinner-border text-secondary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </span>
                      </td>
                    </tr>
                  ) : filteredPersons.filter(person => person.status === status).length === 0 ? (
                    <tr>
                      <td colSpan="16" className="text-center">No persons found</td>
                    </tr>
                  ) : (
                    filteredPersons
                      .filter(person => person.status === status)
                      .map((person, index) => {
                        if (!person) return null;
                        const fatherName = FatherpersonMap.get(person.father_id) || 'N/A';
                        const motherName = personMap.get(person.mother_id) || 'N/A';

                        return (
                          <tr key={person._id}>
                            <td><b>{offset + index + 1}</b></td>
                            <td>
                              {person.image ? (
                                <img
                                  src={person.image}
                                  alt={`${person.first_name} ${person.last_name}`}
                                  style={{
                                    width: 50,
                                    height: 50,
                                    objectFit: 'cover',
                                    borderRadius: '50%'
                                  }}
                                />
                              ) : (
                                <span>No Image</span>
                              )}
                            </td>
                            <td onClick={() => gotoUserDetail(person.pid ?? '')} className="hover:underline cursor-pointer">
                              {person.first_name} {person.last_name}
                            </td>
                            <td>{fatherName}</td>
                            <td>{motherName}</td>
                            <td>{person.email}</td>
                            <td>{person.contact}</td>
                            <td>{person.cnic}</td>
                            <td><span className="badge badge-info">{person.gender?.toUpperCase() || "N/A"}</span></td>
                            <td><span className="badge badge-success">{person.birth_place?.toUpperCase() || 'N/A'}</span></td>
                            <td><span className="badge badge-info">{new Date(person.birth_date).toLocaleDateString()}</span></td>
                            <td><span className={`badge badge-${person.status === "Approved" ? 'success' : 'danger'}`}>{person.status}</span></td>
                            <td><span className="badge badge-info">{person.marital_status?.toUpperCase() || 'N/A'}</span></td>
                            <td><span className="badge badge-primary">{person.blood_group || 'N/A'}</span></td>
                            <td><span className={`badge badge-${person.alive ? 'success' : 'danger'}`}>{person.alive ? 'Alive' : 'Deceased'}</span></td>
                            <td className="text-center">
                              <Dropdown>
                                <Dropdown.Toggle variant="light-grey" id="dropdown-basic">
                                  <em className="icon ni ni-more-h" style={{ color: "black" }}></em>
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
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
                        );
                      })
                  )}
                </tbody>
              </table>

              {!isSearchMode && (
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={handlePageChange}
                />
              )}

              {searchProfile && (
                <SearchUserProfileModal
                  clodeModal={closeSearchModal}
                  onSend={closeSearchModal}
                  profile={currentPersons}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PersonDataTable;
