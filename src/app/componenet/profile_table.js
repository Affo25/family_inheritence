import React from 'react';
import { useRouter } from 'next/navigation';
import Dropdown from 'react-bootstrap/Dropdown';
import Pagination from "../componenet/pagination";

function ProfileDataTable({
  data=[],
  loading = false,
  searchQuery = "",
  offset = 0,
  personsPerPage = 10,
  pagination,
  handleSearchChange = (event) => {},
  handlePageChange = (event) => {},
  openDeleteModal = (event) => {},
  handleEdit = (event) => {},
  openModal = (event) => {},
}) {
  const router = useRouter();

  const gotoUserDetail = async (userId) => {
    if (!userId) return console.error('No user ID provided');
    try {
      router.push(`/Dashboard/PersonDetails/${userId}`);
    } catch (error) {
      console.error('Navigation failed:', error);
      router.push('/error?type=navigation_failed');
    }
  };

  return (
    <div className="card card-bordered card-preview">
      <div className="card-inner-group">
        <div className="card-inner">
          <div className="card-title-group d-flex justify-content-between align-items-center">
            <div className="card-title">
              <h5 className="title">
                User Children Details:
                <span className="badge badge-info ml-2">{data.length}</span>
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
                <th>#</th>
                <th>Image</th>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>CNIC</th>
                <th>Gender</th>
                <th>Birthplace</th>
                <th>Birthdate</th>
                <th>Status</th>
                <th>Marital Status</th>
                <th>Blood Group</th>
                <th>Alive</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody style={{ fontFamily: "Segoe UI" }} className="tb-tnx-body">
              {loading ? (
                <tr>
                  <td colSpan="14" className="text-center">
                    <span className="spinner-border text-secondary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </span>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="14" className="text-center">No persons found</td>
                </tr>
              ) : (
                data.map((person, index) => (
                  <tr key={person._id}>
                    <td><b>{offset + index + 1}</b></td>
                    <td>
                      {person.image ? (
                        <img
                          src={person.image}
                          alt={`${person.first_name} ${person.last_name}`}
                          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '50%' }}
                        />
                      ) : (
                        <span>No Image</span>
                      )}
                    </td>
                    <td onClick={() => gotoUserDetail(person.pid ?? '')} className="hover:underline cursor-pointer">
                      {person.first_name} {person.last_name}
                    </td>
                    <td>{person.email}</td>
                    <td>{person.contact}</td>
                    <td>{person.cnic}</td>
                    <td><span className="badge badge-info">{person.gender || "N/A"}</span></td>
                    <td><span className="badge badge-success">{person.birth_place?.toUpperCase() || "N/A"}</span></td>
                    <td><span className="badge badge-info">{new Date(person.birth_date).toLocaleDateString()}</span></td>
                    <td>
                      <span className={`badge badge-${person.status === "Approved" ? 'success' : 'danger'}`}>
                        {person.status}
                      </span>
                    </td>
                    <td><span className="badge badge-info">{person.marital_status?.toUpperCase()}</span></td>
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
                        <Dropdown.Menu className="dropdown-menu dropdown-menu-top-center dropdown-menu-sm">
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

          <Pagination
            page={pagination.page}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}

export default ProfileDataTable;
