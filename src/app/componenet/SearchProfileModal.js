import React, { useState } from 'react';
import useProfileStore from '../stores/seacrh_profile';

function SearchProfileModal({
    currentPersons,
    offset = 0,
    close,
    handleSelectPerson,
    clearList,
}) {
    // Individual text fields for search instead of checkboxes
    const [filters, setFilters] = useState({
        first_name: '',
        last_name: '',
        email: '',
        contact: '',
        cnic: '',
    });

    const [maritalStatus, setMaritalStatus] = useState("");
    const [gender, setGender] = useState("");
    const [birthPlace, setBirthPlace] = useState("");
    const [isAlive, setIsAlive] = useState(null); // null = any, true/false = filter by alive status

    const {
        searchProfiles,
        profiles,
        loading,
    } = useProfileStore();

    const MARRIAGE_STATUS = ["Single", "Married", "Divorced", "Widowed", "Separated", "Other"];
    const GENDER_OPTIONS = ["Male", "Female", "Other"];
    const BIRTH_PLACES = ["Multan", "Lahore", "Karachi", "Islamabad", "Other"];

    const handleSearch = () => {
        // Build search data from filters
        const searchData = {};

        Object.entries(filters).forEach(([key, value]) => {
            if (value.trim()) {
                searchData[key] = value.trim();
            }
        });

        if (maritalStatus) searchData.marital_status = maritalStatus;
        if (gender) searchData.gender = gender;
        if (birthPlace) searchData.birth_place = birthPlace;

        // Handle isAlive checkbox (null = don't filter by alive status)
        if (isAlive !== null) {
            searchData.alive = isAlive;
        }

        searchProfiles(searchData);
    };

    // Update a filter text field
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    // Handle Is Alive checkbox toggle
    const handleIsAliveChange = () => {
        // Toggle between null -> true -> false -> null for tri-state
        if (isAlive === null) setIsAlive(true);
        else if (isAlive === true) setIsAlive(false);
        else setIsAlive(null);
    };

    return (
        <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-xl" role="document">
                <div style={{ position: "fixed", width: "70%" }} className="modal-content">
                    <div className="modal-header bg-primary">
                        <h5 className="modal-title text-white">Search User Profile</h5>
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
                        {/* Filter Text Inputs */}
                        <div className="mb-3">
                            <div className="row">
                                {["first_name", "last_name", "email", "contact", "cnic"].map(field => (
                                    <div className="col-md-2" key={field}>
                                        <label htmlFor={field} className="form-label">
                                            {field.replace("_", " ").toUpperCase()}
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id={field}
                                            value={filters[field]}
                                            onChange={(e) => handleFilterChange(field, e.target.value)}
                                            placeholder={`Enter ${field.replace("_", " ")}`}
                                        />
                                    </div>
                                ))}

                                {/* Is Alive Checkbox */}
                                <div className="col-md-2 d-flex align-items-center mt-4">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="isAlive"
                                        checked={isAlive === true}
                                        indeterminate={isAlive === null ? "true" : "false"}
                                        onChange={handleIsAliveChange}
                                    />
                                    <label htmlFor="isAlive" className="form-check-label ml-2">
                                        Is Alive
                                        <br />
                                        <small style={{ fontSize: 10 }}>
                                            (Click 3 times: Any / Yes / No)
                                        </small>
                                    </label>
                                </div>
                            </div>

                            {/* Dropdown Filters */}
                            {/* Dropdown Filters + Search Button */}
                            <div className="row mt-3 align-items-end">
                                <div className="col-md-3">
                                    <label>Marital Status</label>
                                    <select
                                        className="form-control"
                                        value={maritalStatus}
                                        onChange={(e) => setMaritalStatus(e.target.value)}
                                    >
                                        <option value="">All</option>
                                        {MARRIAGE_STATUS.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-3">
                                    <label>Gender</label>
                                    <select
                                        className="form-control"
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                    >
                                        <option value="">All</option>
                                        {GENDER_OPTIONS.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-3">
                                    <label>Birthplace</label>
                                    <select
                                        className="form-control"
                                        value={birthPlace}
                                        onChange={(e) => setBirthPlace(e.target.value)}
                                    >
                                        <option value="">All</option>
                                        {BIRTH_PLACES.map(place => (
                                            <option key={place} value={place}>{place}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-3 text-justify-center">
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-md"
                                        onClick={handleSearch}
                                        
                                    >
                                        SEARCH
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* Table */}
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
                                    ) : profiles.length === 0 ? (
                                        <tr>
                                            <td colSpan="11" className="text-center">No persons found</td>
                                        </tr>
                                    ) : (
                                        profiles.map((person, index) => (
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
                                                    <button
                                                        onClick={() => handleSelectPerson(person)}
                                                        className="btn btn-success btn-sm mr-1"
                                                    >
                                                        <i className="icon ni ni-check-circle"></i>
                                                    </button>
                                                    <button
                                                        onClick={clearList}
                                                        className="btn btn-danger btn-sm"
                                                    >
                                                        <i className="icon ni ni-cross-circle"></i>
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
    );
}

export default SearchProfileModal;
