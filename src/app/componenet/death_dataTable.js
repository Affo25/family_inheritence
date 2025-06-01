import React from 'react';
import { useRouter } from 'next/navigation';
import Dropdown from 'react-bootstrap/Dropdown';
import Pagination from '../componenet/pagination';

function DeathDataTable({
  deaths = [],
  persons = [],
  loading = false,
  searchQuery = "",
  
  pagination = { page: 1, pages: 1, offset: 0 },
  handleSearchChange = (event) => { },
  handlePageChange = (event) => { },
  currentPersons = (event) => { },
  openDeleteModal = (event) => { },
  handleEdit = (event) => { },
  openModal = (event) => { }
}) {
  const router = useRouter();


  // Create a map for fast person lookup - moved outside the render loop for better performance
  const personMap = new Map(
    persons.map(p => [p.pid, `${p.first_name} ${p.last_name}`])
  );

  const gotoUserDetail = async (userId) => {
    try {
      if (!userId) {
        console.error('No user ID provided');
        return;
      }
      router.push(`/Dashboard/PersonDetails/${userId}`);
    } catch (error) {
      console.error('Navigation failed:', error);
      router.push('/error?type=navigation_failed');
    }
  };

  const offset = pagination.offset || 0;

  return (
    <div className="card card-bordered card-preview">
          <div className="card-inner-group">
            <div className="card-inner">
              <div className="card-title-group d-flex justify-content-between align-items-center">
                <div className="card-title">
                  <h5 className="title">
                    Total Recorded:
                    <span className="badge badge-info ml-2">{deaths.length}</span>
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
                    <th>Person</th>
                    <th>Death Place</th>
                    <th>Death Reason</th>
                    <th>Death Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody style={{ fontFamily: "Segoe UI" }} className="tb-tnx-body">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center">
                        <span className="spinner-border text-secondary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </span>
                      </td>
                    </tr>
                  ) : deaths.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center">No Record found</td>
                    </tr>
                  ) : (
                    deaths
                      .filter(death => death != null) // Remove null/undefined records
                      .map((death, index) => {
                        if (!death) return null;
                        const fullName = personMap.get(death.prodile_id) || 'N/A';

                        return (
                          <tr key={death.death_id || index}>
                            <td>{offset + index + 1}</td>
                            <td
                              onClick={() => gotoUserDetail(death.prodile_id)}
                              className="hover:underline cursor-pointer"
                            >
                              {fullName}
                            </td>
                            <td>
                              <span className="badge badge-info">
                                {death.death_place ? death.death_place : "N/A"}
                              </span>
                            </td>
                            <td>
                              <span className="badge badge-primary">
                                {death.death_reason || 'N/A'}
                              </span>
                            </td>
                            <td>
                              <span className="badge badge-warning">
                                {new Date(death.death_date).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="text-center">
                              <button type="button" className="btn btn-danger btn-sm ml-1" onClick={() => openDeleteModal(death)}>
                                <span>Delete</span>
                              </button>
                              <button type="button" className="btn btn-primary btn-sm ml-1" onClick={() => handleEdit(death)}>
                                <span>Edit</span>
                              </button>
                            </td>
                          </tr>
                        )
                      }
                      )
                  )}
                </tbody>
              </table>

              {pagination && (
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </div>
  );
}

export default DeathDataTable;
