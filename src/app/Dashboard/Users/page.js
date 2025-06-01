"use client";
import React, { useState, useEffect } from "react";
import 'react-datepicker/dist/react-datepicker.css';
import ReactPaginate from "react-paginate";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import userStore from '../../stores/userStore';
import UserDeleteModal from "../../componenet/userDeleteModal";

function Page() {
    // State for pagination and search
    const [currentPage, setCurrentPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [userTypeFilter, setUserTypeFilter] = useState('');
    const [itemsPerPage] = useState(10);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [personToDelete, setPersonToDelete] = useState(null);
    

    // Get state and actions from userStore
    const {
        users,
        loading,
        error,
        modalOpen,
        formData,
        formErrors,
        fetchUsers,
        toggleModal,
        closeModal,
        setFormData,
        saveUser,
        deleteUser,
        resetForm
    } = userStore();
    const USER_TYPE = ['Admin', 'User'];
    const STATUS = ['Active', 'Inactive'];

    // Calculate pagination
    const offset = currentPage * itemsPerPage;
    const currentUsers = users.slice(offset, offset + itemsPerPage);

    // Handle page change
    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    // Handle search change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(0); // Reset to first page on search
    };

    // Handle filter change
    const handleFilterChange = (filter, value) => {
        if (filter === 'status') {
            setStatusFilter(value);
        } else if (filter === 'userType') {
            setUserTypeFilter(value);
        }
        setCurrentPage(0); // Reset to first page on filter change
    };

    // Apply filters
    const filteredUsers = users.filter(user => {
        const matchesSearch = searchQuery === '' ||
            user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.contact.includes(searchQuery);

        const matchesStatus = statusFilter === '' || user.status === statusFilter;
        const matchesUserType = userTypeFilter === '' || user.user_type === userTypeFilter;

        return matchesSearch && matchesStatus && matchesUserType;
    });

    // Export to Excel
    const exportUsersToExcel = async (fileName = 'users_data.xlsx') => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Users');

        if (users.length === 0) {
            toast.warning('No data to export');
            return;
        }

        // Define headers
        const headerMap = {
            first_name: 'First Name',
            last_name: 'Last Name',
            email: 'Email',
            contact: 'Contact',
            user_type: 'User Type',
            status: 'Status',
            created_on: 'Created On'
        };

        worksheet.columns = Object.entries(headerMap).map(([key, header]) => ({
            header,
            key,
            width: 20,
        }));

        // Format the data for Excel
        const formattedData = users.map(user => {
            const row = { ...user };
            if (row.created_on) {
                row.created_on = new Date(row.created_on).toLocaleDateString();
            }
            return row;
        });

        formattedData.forEach(row => worksheet.addRow(row));

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, fileName);
        toast.success('Excel file downloaded successfully');
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ [name]: value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        await saveUser();
    };

    const handleDelete = async (personId,userName) => {
    try {
      const success = await deleteUser(personId);
      if (success) {
        setCloseDeleteModal();
        console.log('User deleted successfully');
      } else {
        console.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error in handleDelete:', error);
    }
  };

  const openDeleteModal = (person) => {
    setPersonToDelete(person);
    setIsDeleteModalOpen(true);
  };

     const setCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPersonToDelete(null);
  };

    // Fetch users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="nk-content-body">
            <div className="nk-block-head nk-block-head-sm p-0">
                <div className="nk-block-between">
                    <div className="nk-block-head-content">
                        <h3 className="nk-block-title page-title">Users Management</h3>
                        <div className="nk-block-des text-soft">
                            <p>Manage and keep track of all users in the system</p>
                        </div>
                    </div>
                    <div className="nk-block-head-content">
                        <ul className="nk-block-tools gx-3">
                            <li>
                                <button
                                    className="btn btn-primary ml-1"
                                    onClick={() => toggleModal()}
                                >
                                    <span>Add User</span>
                                </button>
                                <button
                                    className="btn btn-danger ml-1"
                                    onClick={() => exportUsersToExcel()}
                                >
                                    <span>Download Excel</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="row pt-3">
                    <div className="col-12">
                        <div className="card card-bordered card-preview">
                            <div className="card-inner-group">
                                <div className="card-inner">
                                    <div className="card-title-group d-flex justify-content-between align-items-center">
                                        <div className="card-title">
                                            <h5 className="title">
                                                Total Users:
                                                <span className="badge badge-info ml-2">{filteredUsers.length}</span>
                                            </h5>
                                        </div>

                                        <div className="d-flex">
                                            <div className="mx-1">
                                                <select
                                                    className="form-select"
                                                    value={statusFilter}
                                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                                >
                                                    <option value="">All Status</option>
                                                    <option value="Active">Active</option>
                                                    <option value="Inactive">Inactive</option>
                                                </select>
                                            </div>

                                            <div className="mx-1">
                                                <select
                                                    className="form-select"
                                                    value={userTypeFilter}
                                                    onChange={(e) => handleFilterChange('userType', e.target.value)}
                                                >
                                                    <option value="">All Types</option>
                                                    <option value="Admin">Admin</option>
                                                    <option value="User">User</option>
                                                </select>
                                            </div>

                                            <div className="col-md-6 ml-1">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Search users..."
                                                    value={searchQuery}
                                                    onChange={handleSearchChange}
                                                />
                                            </div>
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
                                                <th>User Type</th>
                                                <th>Status</th>
                                                <th>Created On</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody style={{ fontFamily: "Segoe UI" }} className="tb-tnx-body">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan="8" className="text-center">
                                                        <span className="spinner-border text-secondary" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </span>
                                                    </td>
                                                </tr>
                                            ) : filteredUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" className="text-center">No users found</td>
                                                </tr>
                                            ) : (
                                                filteredUsers
                                                    .slice(offset, offset + itemsPerPage)
                                                    .map((user, index) => (
                                                        <tr key={user._id}>
                                                            <td><b>{offset + index + 1}</b></td>
                                                            <td>
                                                                {user.first_name} {user.last_name}
                                                            </td>
                                                            <td>{user.email}</td>
                                                            <td>{user.contact}</td>
                                                            <td>
                                                                <span className={`badge badge-${user.user_type === 'Admin' ? 'primary' : 'info'}`}>
                                                                    {user.user_type}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className={`badge badge-${user.status === 'Active' ? 'success' : 'danger'}`}>
                                                                    {user.status}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                {user.created_on ? new Date(user.created_on).toLocaleDateString() : 'N/A'}
                                                            </td>
                                                            <td>
                                                                <div className="btn-group">
                                                                    <button
                                                                        className="btn btn-primary btn-sm ml-1"
                                                                        onClick={() => toggleModal(user)}
                                                                    >
                                                                        <span>Edit</span>
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-danger btn-sm ml-1"
                                                                        onClick={openDeleteModal}
                                                                    >
                                                                        <span>Delete</span>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                            )}
                                        </tbody>
                                    </table>

                                    {filteredUsers.length > itemsPerPage && (
                                        <ReactPaginate
                                            previousLabel={"Previous"}
                                            nextLabel={"Next"}
                                            pageCount={Math.ceil(filteredUsers.length / itemsPerPage)}
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
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Modal */}
            <div className={`modal fade ${modalOpen ? 'show' : ''}`} style={{ display: modalOpen ? 'block' : 'none' }}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{formData._id ? 'Edit User' : 'Add New User'}</h5>
                            <button type="button" className="btn-close" onClick={closeModal}></button>
                        </div>
                        <div className="modal-body">
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label">First Name</label>
                                    <div className="form-control-wrap">
                                        <input
                                            type="text"
                                            name="first_name"
                                            className={`form-control ${formErrors.first_name ? 'is-invalid' : ''}`}
                                            value={formData.first_name || ''}
                                            onChange={handleInputChange}
                                        />
                                        {formErrors.first_name && (
                                            <div className="invalid-feedback">
                                                {formErrors.first_name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label">Last Name</label>
                                    <div className="form-control-wrap">
                                        <input
                                            type="text"
                                            name="last_name"
                                            className={`form-control ${formErrors.last_name ? 'is-invalid' : ''}`}
                                            value={formData.last_name || ''}
                                            onChange={handleInputChange}
                                        />
                                        {formErrors.last_name && (
                                            <div className="invalid-feedback">
                                                {formErrors.last_name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <div className="form-control-wrap">
                                        <input
                                            type="email"
                                            name="email"
                                            className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                                            value={formData.email || ''}
                                            onChange={handleInputChange}
                                        />
                                        {formErrors.email && (
                                            <div className="invalid-feedback">
                                                {formErrors.email}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label">Contact</label>
                                    <div className="form-control-wrap">
                                        <input
                                            type="text"
                                            name="contact"
                                            className={`form-control ${formErrors.contact ? 'is-invalid' : ''}`}
                                            value={formData.contact || ''}
                                            onChange={handleInputChange}
                                        />
                                        {formErrors.contact && (
                                            <div className="invalid-feedback">
                                                {formErrors.contact}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label">Password {formData._id && '(Leave blank to keep current)'}</label>
                                    <div className="form-control-wrap">
                                        <input
                                            type="password"
                                            name="password"
                                            className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                                            value={formData.password || ''}
                                            onChange={handleInputChange}
                                        />
                                        {formErrors.password && (
                                            <div className="invalid-feedback">
                                                {formErrors.password}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label">User Type</label>
                                    <div className="form-control-wrap">
                                        <select
                                            name="user_type"
                                            className={`form-select form-control ${formErrors.user_type ? 'is-invalid' : ''}`}
                                            value={formData.user_type || ''}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select User Type</option>
                                            {USER_TYPE.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        {formErrors.user_type && (
                                            <div className="invalid-feedback">
                                                {formErrors.user_type}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <div className="form-control-wrap">
                                        <select
                                            name="status"
                                            className={`form-select form-control ${formErrors.status ? 'is-invalid' : ''}`}
                                            value={formData.status || ''}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Status</option>
                                            {STATUS.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                        {formErrors.status && (
                                            <div className="invalid-feedback">
                                                {formErrors.status}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>


                        </div>
                    </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                        Saving...
                                    </>
                                ) : (
                                    'Save User'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {modalOpen && <div className="modal-backdrop fade show"></div>}

             {isDeleteModalOpen && (
          <UserDeleteModal
            personToDelete={personToDelete}
            loading={loading}
            setCloseDeleteModal={setCloseDeleteModal}
            handleDelete={handleDelete}
          />
        )}
        </div>
        
    );
}

export default Page;
