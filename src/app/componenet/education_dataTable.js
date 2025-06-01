import { React } from 'react';
import { useRouter } from 'next/navigation'; // Correct import for App Router

import Dropdown from 'react-bootstrap/Dropdown';
import ReactPaginate from 'react-paginate';
import Link from 'next/link';
import Pagination from "../componenet/pagination";

function EducationDataTable({ currentPersons, educations, persons = [], loading = false, searchQuery = "", offset = 0, personsPerPage = 10, pagination,
  filteredPersons = [], handleSearchChange = (event) => { }, handlePageClick = (event) => { }, handlePageChange = (event) => { }, openDeleteModal = (event) => { },
  handleEdit = (event) => { }, openModal = (event) => { } }) {

  const router = useRouter();

  // Create a map for fast person lookup - moved outside the render loop for better performance
  const personMap = new Map(
    persons.map(p => [p.pid, `${p.first_name} ${p.last_name}`])
  );

  const gotoUserDetail = async (userId) => {
    try {
      // Validate userId exists
      if (!userId) {
        console.error('No user ID provided');
        return;
      }
      router.push(`/Dashboard/PersonDetails/${userId}`);

    } catch (error) {
      console.error('Navigation failed:', error);
      // Fallback or error handling
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
                    Education Records
                    <span className="badge badge-info ml-2">{educations.length}</span>
                  </h5>
                </div>
              </div>
            </div>

            <div className="card-inner p-0 table-responsive">
              <table className="table table-hover nowrap align-middle dataTable-init">
                <thead style={{ fontSize: "14px", fontWeight: 'bold' }} className="tb-tnx-head">
                  <tr>
                    <th scope="col">#</th>
                    <th>Person</th>
                    <th>Class Name</th>
                    <th>Year</th>
                    <th>Institute</th>
                    <th>CreatedOn</th>
                    <th>UpdatedOn</th>
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
                  ) : educations.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center">No Record found</td>
                    </tr>
                  ) : (
                    educations
                      .filter(education => education != null) // Remove null/undefined records
                      .map((education, index) => {
                        if (!education) return null;
                        const fullName = personMap.get(education.prodile_id) || 'N/A';

                        return (
                          <tr key={education.prodile_id || index}>
                            <td>{offset + index + 1}</td>
                            <td
                              onClick={() => gotoUserDetail(education.prodile_id)}
                              className="hover:underline cursor-pointer"
                            >
                              {fullName}
                            </td>
                            <td>
                              <span className="badge badge-primary">
                                {education.class_name ? education.class_name : "N/A"}
                              </span>
                            </td>
                            <td>
                              <span className="badge badge-primary">
                                {education.year || 'N/A'}
                              </span>
                            </td>
                            <td>
                              <span className="badge badge-warning">
                                {education.institute}
                              </span>
                            </td>
                             <td>
                              <span className="badge badge-warning">
                                {education.created_on}
                              </span>
                            </td>
                            <td className="text-center">
                              <button type="button" className="btn btn-danger btn-sm ml-1" onClick={() => openDeleteModal(education)}>
                                <span>Delete</span>
                              </button>
                              <button type="button" className="btn btn-primary btn-sm ml-1" onClick={() => handleEdit(education)}>
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

            </div>
          </div>
        </div>
  );
}

export default EducationDataTable;
